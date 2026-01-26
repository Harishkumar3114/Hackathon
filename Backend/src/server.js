import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; // Adjust path if needed
import hubRoutes from './routes/hubRoutes.js';
import trackRoutes from './routes/trackRoutes.js'

const app = express();
app.set('trust proxy', true); 
// 1. Connect to Database

connectDB(); 

app.use(cors());
app.use(express.json());

app.use('/api/hub', hubRoutes);
app.use('/api/track', trackRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));