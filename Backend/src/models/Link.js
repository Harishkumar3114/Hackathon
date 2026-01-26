import mongoose from 'mongoose';

// models/Link.js
const LinkSchema = new mongoose.Schema({
  hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
  label: { type: String, required: true },
  url: { type: String, required: true },
  
  // Intelligence Fields
  priority: { type: Number, default: 0 }, // Higher number = higher on the list
  clickCount: { type: Number, default: 0 }, 

  rules: [{
    type: { type: String, enum: ['device', 'location', 'time'] },
    config: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true });

export default mongoose.model('Link', LinkSchema);