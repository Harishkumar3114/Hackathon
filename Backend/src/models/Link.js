import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
  hubId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hub', 
    required: true, 
    index: true // 🚀 OPTIMIZATION: Makes fetching links for a hub 10x faster
  },
  label: { type: String, required: true },
  url: { type: String, required: true },
  
  // Intelligence Fields
  priority: { type: Number, default: 0, index: -1 }, // Index for fast sorting
  clickCount: { type: Number, default: 0 }, 

  rules: [{
    type: { type: String, enum: ['device', 'location', 'time'] },
    config: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true });

// COMPOUND INDEX: Perfect for the Public Fetch logic
// This optimizes: Find by hubId -> Sort by Priority -> Sort by Clicks
LinkSchema.index({ hubId: 1, priority: -1, clickCount: -1 });

export default mongoose.model('Link', LinkSchema);