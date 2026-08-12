// =============================================================================
// Express Server - Hunar AI Hiring Assistant API
// =============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const searchRoutes = require('./routes/search');
const hunarRoutes = require('./routes/hunar');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  if (req.method !== 'GET' || req.path === '/api/health') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/hunar', hunarRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Hunar AI Hiring Assistant API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Hunar AI Hiring Assistant API running on http://localhost:${PORT}`);
  console.log(`📡 API Mode: ${process.env.API_MODE || 'live'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});
