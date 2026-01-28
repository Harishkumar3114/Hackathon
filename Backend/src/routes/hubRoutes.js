import express from "express";
import { nanoid } from "nanoid";
import geoip from "geoip-lite";
import Hub from "../models/Hub.js";
import Link from "../models/Link.js";
import { evaluateRules } from "../utils/ruleEngine.js";

const router = express.Router();

// 1️⃣ CREATE HUB - Returns hubId and editToken
router.post("/create", async (req, res) => {
  try {
    const { title, description, links } = req.body;
    const slug = nanoid(8);
    const editToken = nanoid(24);

    const newHub = new Hub({
      slug,
      editToken,
      title: title || "My New Hub",
      description: description || "",
    });

    const savedHub = await newHub.save();

    if (links && Array.isArray(links)) {
      const linksToCreate = links.map((link) => ({
        hubId: savedHub._id,
        label: link.label.trim(),
        url: link.url.trim(),
        priority: Number(link.priority) || 0,
        rules: link.rules || [],
      }));
      await Link.insertMany(linksToCreate);
    }

    res.status(201).json({
      message: "Hub created successfully",
      slug: savedHub.slug,
      editToken: savedHub.editToken,
    });
  } catch (error) {
    console.error("❌ Hub Creation Error:", error);
    res.status(500).json({ error: "Failed to create hub" });
  }
});

// 2️⃣ SYNC LINKS - Update hub links atomically
router.put("/edit/:editToken/sync", async (req, res) => {
  try {
    const { editToken } = req.params;
    const { links } = req.body;

    // Find Hub by token only
    const hub = await Hub.findOne({ editToken });
    if (!hub) return res.status(401).json({ error: "Invalid edit token" });

    // Prepare links with unique rules (last rule of each type wins)
    const linksToCreate = links.map((link) => {
      const uniqueRules = [];
      const seenTypes = new Set();
      if (link.rules && Array.isArray(link.rules)) {
        [...link.rules].reverse().forEach((rule) => {
          if (!seenTypes.has(rule.type)) {
            uniqueRules.push(rule);
            seenTypes.add(rule.type);
          }
        });
      }

      return {
        hubId: hub._id,
        label: link.label?.trim() || "",
        url: link.url?.trim() || "",
        priority: Number(link.priority) || 0,
        rules: uniqueRules.reverse(),
      };
    });

    // Atomic Sync: Wipe and replace links
    await Link.deleteMany({ hubId: hub._id });
    const savedLinks = await Link.insertMany(linksToCreate);

    res.status(200).json({
      message: "Links synced successfully",
      links: savedLinks,
    });
  } catch (error) {
    console.error("❌ Sync Error:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});

// 3️⃣ PUBLIC FETCH - Increment visit count and return filtered links
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const userAgent = req.headers["user-agent"] || "";
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(
      userAgent,
    );

    // Increment visitCount only for non-bot traffic
    const hub = await Hub.findOneAndUpdate(
      { slug },
      isBot ? {} : { $inc: { visitCount: 1 } },
      { new: true, lean: true },
    );

    if (!hub) return res.status(404).json({ error: "Hub not found" });

    const allLinks = await Link.find({ hubId: hub._id }).lean();

    // Get visitor context for rule evaluation
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip === "::1" ? "207.97.227.239" : ip);
    const visitorHour =
      parseInt(req.headers["x-visitor-hour"]) || new Date().getHours();

    const context = {
      device: /Mobile|Android|iPhone/i.test(userAgent) ? "mobile" : "desktop",
      location: { country: geo?.country || "Unknown" },
      timeHour: visitorHour,
    };

    // Filter links based on rules
    const finalLinks = evaluateRules(allLinks, context);

    res.json({
      title: hub.title,
      description: hub.description,
      links: finalLinks.map((l) => ({ id: l._id, label: l.label, url: l.url })),
    });
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    res.status(500).json({ error: "Engine failure" });
  }
});

// 4️⃣ FETCH EDITOR DATA - Returns hub info, links, and detailed analytics
router.get("/edit/:editToken", async (req, res) => {
  try {
    const { editToken } = req.params;

    // 1. Find the Hub
    const hub = await Hub.findOne({ editToken }).lean();
    if (!hub) return res.status(401).json({ error: "Invalid token" });

    // 2. Find all associated links
    const links = await Link.find({ hubId: hub._id }).lean();

    // 3. Calculate Global Totals
    const totalHubClicks = links.reduce(
      (acc, l) => acc + (l.clickCount || 0),
      0,
    );
    const totalVisits = hub.visitCount || 0;

    // 4. Generate Detailed Analytics for the Table
    const detailedAnalytics = links.map((link) => {
      // Calculate CTR: (Clicks / Total Hub Visits) * 100
      const ctrValue =
        totalVisits > 0
          ? ((link.clickCount / totalVisits) * 100).toFixed(1)
          : "0.0";

      // Calculate Performance Tier
      let performance = "Learning";
      if (totalVisits >= 5) {
        performance = parseFloat(ctrValue) > 50 ? "High" : "Average";
      }

      return {
        label: link.label,
        totalClicks: link.clickCount || 0,
        ctr: `${ctrValue}%`,
        performance: performance,
      };
    });

    // 5. Return the structured response with ALL required data
    res.json({
      hubSummary: {
        title: hub.title,
        description: hub.description,
        totalVisits: totalVisits, // ✅ FIXED: Now included
        totalClicks: totalHubClicks, // ✅ FIXED: Now included
      },
      links, // Original links for the Editor fields
      detailedAnalytics, // ✅ FIXED: Now included in response
    });
  } catch (error) {
    console.error("❌ Stats Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

export default router;
