const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Idhi add chesa, indhaka miss ayindi
const connectDB = require('./config/db');

// 1. Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────
// CORS: Deployment lo Vercel URL ni allow cheyali
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL // Ikkada Vercel URL pettu Render Env Vars lo
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Localhost or Vercel URL or Postman (no origin) allow chesthadhi
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));

// ── Health check (Render monitors this to keep app alive) ──
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV,
    dbConnected: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err.message);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    // Production lo users ki code details chupinchakudadhu
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Render automatic ga PORT assign chesthundhi, default 5000 pettuko
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ShopFlow API running on port ${PORT}`);
});