import mongoose from 'mongoose';

const HubSchema = new mongoose.Schema({
  title: { type: String, default: 'My Smart Link Hub' },
  description: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  editToken: { type: String, required: true, unique: true },
  isPublic: { type: Boolean, default: true },
  visitCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Hub', HubSchema);