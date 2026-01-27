import express from "express";
import { nanoid } from "nanoid";
import geoip from "geoip-lite";
import Hub from "../models/Hub.js";
import Link from "../models/Link.js";
import { evaluateRules } from "../utils/ruleEngine.js";

const router = express.Router();

// 1️⃣ CREATE HUB - Now returns hubId too
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
      editToken: savedHub.editToken, // We only need this token now
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create hub" });
  }
});

router.put("/edit/:editToken/sync", async (req, res) => {
  try {
    const { editToken } = req.params;
    const { links } = req.body;

    // Find Hub by token only
    const hub = await Hub.findOne({ editToken });
    if (!hub) return res.status(401).json({ error: "Invalid edit token" });

    // Prepare links
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
    res.status(500).json({ error: "Sync failed" });
  }
});

// 4️⃣ FETCH EDITOR DATA - Uses ONLY editToken
router.get("/edit/:editToken", async (req, res) => {
  try {
    const { editToken } = req.params;

    const hub = await Hub.findOne({ editToken }).lean();
    if (!hub) return res.status(401).json({ error: "Invalid token" });

    const links = await Link.find({ hubId: hub._id }).lean();

    res.json({
      hubSummary: {
        title: hub.title,
        description: hub.description,
      },
      links,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// 2️⃣ PUBLIC FETCH - No changes needed
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const userAgent = req.headers["user-agent"] || "";
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(
      userAgent,
    );

    const hub = await Hub.findOneAndUpdate(
      { slug },
      isBot ? {} : { $inc: { visitCount: 1 } },
      { new: true, lean: true },
    );

    if (!hub) return res.status(404).json({ error: "Hub not found" });

    const allLinks = await Link.find({ hubId: hub._id }).lean();

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

    const finalLinks = evaluateRules(allLinks, context);

    res.json({
      title: hub.title,
      description: hub.description,
      links: finalLinks.map((l) => ({ id: l._id, label: l.label, url: l.url })),
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Engine failure" });
  }
});

export default router;
