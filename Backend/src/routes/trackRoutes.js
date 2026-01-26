import express from 'express';
import Link from '../models/Link.js';

const router = express.Router();

// 5️⃣ TRACK CLICK: POST /api/track/click/:linkId
router.post('/click/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    // We use findByIdAndUpdate with $inc (increment) 
    // This is atomic and ensures we don't lose clicks during high traffic
    const link = await Link.findByIdAndUpdate(
      linkId,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Return a success message (The frontend doesn't usually need the full object)
    res.json({ 
      success: true, 
      label: link.label, 
      currentClicks: link.clickCount 
    });
  } catch (error) {
    res.status(500).json({ error: "Tracking failed" });
  }
});

export default router;