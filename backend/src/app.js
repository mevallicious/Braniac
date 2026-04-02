import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path"
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import brainRoutes from './routes/brain.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',                   
    'https://your-frontend-url.onrender.com'   
  ],
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));


app.use('/api/auth', authRoutes);
app.use('/api/brain', brainRoutes);
app.use("*name",(req,res)=>{
res.sendFile(path.join(__dirname, "..", "public", "index.html"));
})

export default app;