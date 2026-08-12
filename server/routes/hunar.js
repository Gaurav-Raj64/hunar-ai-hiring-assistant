// =============================================================================
// Hunar Voice AI Routes - Agents, Calls, Numbers, Webhooks
// =============================================================================

const express = require('express');
const router = express.Router();
const hunarService = require('../services/hunarService');

// ---------- Health / Mode ----------

// GET /api/hunar/health - Check API mode and connectivity
router.get('/health', async (req, res) => {
  const status = await hunarService.checkApiHealth();
  res.json({ success: true, data: status });
});

// POST /api/hunar/config - Update API key at runtime
router.post('/config', (req, res) => {
  const { api_key } = req.body;
  if (api_key) {
    hunarService.updateApiKey(api_key);
    res.json({ success: true, message: 'API key updated. Use /health to verify connectivity.' });
  } else {
    res.status(400).json({ success: false, message: 'api_key is required' });
  }
});

// ---------- Agents ----------

// GET /api/hunar/agents - List agents
router.get('/agents', async (req, res) => {
  try {
    const data = await hunarService.listAgents(req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hunar/agents/:id - Get agent details
router.get('/agents/:id', async (req, res) => {
  try {
    const agent = await hunarService.getAgent(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    res.json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/hunar/agents - Create a new agent
router.post('/agents', async (req, res) => {
  try {
    const result = await hunarService.createAgent(req.body);
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Calls ----------

// POST /api/hunar/calls - Create a single call
router.post('/calls', async (req, res) => {
  try {
    const result = await hunarService.createCall(req.body);
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/hunar/calls/bulk - Create bulk calls
router.post('/calls/bulk', async (req, res) => {
  try {
    const result = await hunarService.createBulkCalls(req.body);
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hunar/calls - List calls with filtering
router.get('/calls', async (req, res) => {
  try {
    const data = await hunarService.listCalls(req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hunar/calls/:id - Get call details
router.get('/calls/:id', async (req, res) => {
  try {
    const call = await hunarService.getCall(req.params.id);
    if (!call) return res.status(404).json({ success: false, message: 'Call not found' });
    res.json({ success: true, data: call });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Numbers ----------

// GET /api/hunar/numbers - List phone numbers
router.get('/numbers', async (req, res) => {
  try {
    const data = await hunarService.listNumbers(req.query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Stats ----------

// GET /api/hunar/stats - Get aggregated call statistics
router.get('/stats', (req, res) => {
  try {
    const stats = hunarService.getCallStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Webhook Receiver ----------

// POST /api/hunar/webhook/:type - Receive webhooks from Hunar
router.post('/webhook/:type', (req, res) => {
  const { type } = req.params;
  console.log(`[Webhook] Received ${type}:`, JSON.stringify(req.body, null, 2));
  // In production: store webhook events, update call status, trigger downstream workflows
  res.json({ success: true, received: type, timestamp: new Date().toISOString() });
});

module.exports = router;
