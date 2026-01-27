import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import hubRoutes from './routes/hubRoutes.js';
import trackRoutes from './routes/trackRoutes.js';

const app = express();
app.set('trust proxy', true); 

// 1. Connect to Database
connectDB(); 

// 🔧 FIX: Proper CORS configuration BEFORE other middleware
app.use(cors({
  origin: ['https://link-hub-client.onrender.com', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-visitor-hour', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 2. Body parser MUST come after CORS
app.use(express.json());

// 3. Routes
app.use('/api/hub', hubRoutes);
app.use('/api/track', trackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));