import express from 'express';
import { nanoid } from 'nanoid';
import geoip from 'geoip-lite';
import Hub from '../models/Hub.js';
import Link from '../models/Link.js';
import { evaluateRules } from '../utils/ruleEngine.js';

const router = express.Router();

// 1️⃣ CREATE HUB
router.post('/create', async (req, res) => {
  try {
    const slug = nanoid(8);
    const editToken = nanoid(24);

    const newHub = new Hub({
      slug,
      editToken,
      title: req.body.title || "My New Hub",
      description: req.body.description || ""
    });

    const savedHub = await newHub.save();
    res.status(201).json({
      message: "Hub created successfully",
      slug: savedHub.slug,
      editToken: savedHub.editToken
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create hub" });
  }
});

// 2️⃣ PUBLIC FETCH (INTELLIGENT RANKING)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const userAgent = req.headers['user-agent'] || '';

    // EDGE CASE: Bot Filtering
    // Don't count visits from search engine crawlers to keep CTR accurate
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent);

    const hub = await Hub.findOneAndUpdate(
      { slug, isPublic: true },
      isBot ? {} : { $inc: { visitCount: 1 } }, // Only increment if NOT a bot
      { new: true }
    );

    if (!hub) return res.status(404).json({ error: "Hub not found" });

    const allLinks = await Link.find({ hubId: hub._id });

    // CONTEXT BUILDING
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip === '::1' ? '207.97.227.239' : ip);
    
    const visitorHour = req.headers['x-visitor-hour'] 
      ? parseInt(req.headers['x-visitor-hour']) 
      : new Date().getHours();

    const context = {
      device: /Mobile|Android|iPhone/i.test(userAgent) ? 'mobile' : 'desktop',
      location: { country: geo?.country || 'Unknown' },
      timeHour: visitorHour
    };

    // RUN ENGINE
    const finalLinks = evaluateRules(allLinks, context);

    res.json({
      title: hub.title,
      description: hub.description,
      stats: {
        isBotDetected: isBot,
        totalLinksFound: finalLinks.length
      },
      links: finalLinks.map(l => ({
        id: l._id,
        label: l.label,
        url: l.url
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Engine failure" });
  }
});

// 3️⃣ SYNC LINKS & RULES (WITH PRIORITY)
// 3️⃣ SYNC LINKS & RULES (WITH CONFLICT RESOLUTION)
router.put('/edit/:editToken/sync', async (req, res) => {
  try {
    const { editToken } = req.params;
    const { links } = req.body; 

    // 1. Verify Hub Ownership
    const hub = await Hub.findOne({ editToken });
    if (!hub) return res.status(401).json({ error: "Invalid edit token" });

    // 2. Sanitize and Validate Links
    const linksToCreate = links.map(link => {
      // COMPLEX RULE LOGIC: Conflict Resolution
      // If a user sends two 'device' rules, we only keep the last one.
      // This prevents the "Recursive Loop" where a link is hidden for everyone.
      const uniqueRules = [];
      const seenTypes = new Set();
      
      // We process rules in reverse to keep the most recent configuration
      if (link.rules && Array.isArray(link.rules)) {
        [...link.rules].reverse().forEach(rule => {
          if (!seenTypes.has(rule.type)) {
            uniqueRules.push(rule);
            seenTypes.add(rule.type);
          }
        });
      }

      return {
        hubId: hub._id,
        label: link.label.trim(), // Remove accidental whitespace
        url: link.url.trim(),
        priority: Number(link.priority) || 0, // Ensure it's a number
        rules: uniqueRules.reverse() // Flip back to original order
      };
    });

    // 3. ATOMIC SYNC: Wipe old links and batch insert new ones
    // Note: In a large app, you'd use a MongoDB Session for a real transaction.
    // For an MVP, deleteMany + insertMany is the fastest "Wipe and Replace" method.
    await Link.deleteMany({ hubId: hub._id });
    const savedLinks = await Link.insertMany(linksToCreate);

    res.status(200).json({
      message: "Hub synced successfully. Logical conflicts resolved.",
      count: savedLinks.length,
      links: savedLinks
    });
  } catch (error) {
    console.error("Critical Sync Error:", error);
    res.status(500).json({ error: "Internal server error during sync" });
  }
});


// 4️⃣ FETCH ANALYTICS (FOR CREATOR)
// routes/hubRoutes.js

router.get('/edit/:editToken', async (req, res) => {
  try {
    const { editToken } = req.params;
    const hub = await Hub.findOne({ editToken });
    if (!hub) return res.status(401).json({ error: "Invalid token" });

    const links = await Link.find({ hubId: hub._id });
    const totalHubClicks = links.reduce((acc, l) => acc + l.clickCount, 0);

    const detailedAnalytics = links.map(link => {
      // 1. Calculate CTR
      const ctr = hub.visitCount > 0 ? ((link.clickCount / hub.visitCount) * 100).toFixed(1) : 0;
      
      // 2. Intelligence Tier: Confidence Score
      // If visits are low (< 5), we shouldn't call it "High Performance" yet
      let performance = "Pending Data";
      if (hub.visitCount >= 5) {
        performance = ctr > 50 ? 'High' : ctr > 20 ? 'Average' : 'Low';
      }

      // 3. Intelligence Tier: Trending (Velocity)
      // A link is "Trending" if it owns more than 50% of ALL hub clicks
      const isTrending = totalHubClicks > 5 && (link.clickCount / totalHubClicks) > 0.5;

      return {
        label: link.label,
        totalClicks: link.clickCount,
        ctr: `${ctr}%`,
        performance,
        isTrending,
        // 4. Intelligence Tier: Recommendation logic
        insight: ctr > 100 
          ? "Users are clicking this multiple times! Add more content like this." 
          : hub.visitCount < 5 
          ? "Collecting more data to provide insights..." 
          : "Standard performance."
      };
    });

    res.json({
      hubSummary: {
        title: hub.title,
        totalVisits: hub.visitCount,
        totalClicks: totalHubClicks,
        status: hub.visitCount < 5 ? "Learning" : "Active"
      },
      detailedAnalytics
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});


export default router;