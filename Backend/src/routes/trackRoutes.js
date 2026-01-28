import express from "express";
import Link from "../models/Link.js";

const router = express.Router();

// 5️⃣ TRACK CLICK: POST /api/track/click/:linkId
router.post("/click/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;

    // Validate linkId format (MongoDB ObjectId is 24 hex characters)
    if (!linkId || !/^[0-9a-fA-F]{24}$/.test(linkId)) {
      return res.status(400).json({ error: "Invalid link ID format" });
    }

    // Use findByIdAndUpdate with $inc (increment)
    // This is atomic and ensures we don't lose clicks during high traffic
    const link = await Link.findByIdAndUpdate(
      linkId,
      { $inc: { clickCount: 1 } },
      { new: true }, // Return the updated document
    );

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Return a success message with current click count
    res.json({
      success: true,
      label: link.label,
      currentClicks: link.clickCount,
    });
  } catch (error) {
    console.error("❌ Click Tracking Error:", error);
    res.status(500).json({ error: "Tracking failed" });
  }
});

export default router;
