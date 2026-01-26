import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Ensure this matches your .env key exactly: MONGO_URI
    await mongoose.connect(process.env.MONGO_URI); 
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB error", err);
    process.exit(1);
  }
};

export default connectDB;