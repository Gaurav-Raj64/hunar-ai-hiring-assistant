// =============================================================================
// Search Routes - Candidate Sourcing & JD Parsing
// =============================================================================

const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');

// POST /api/search/parse-jd - Parse a job description and extract search params
router.post('/parse-jd', (req, res) => {
  try {
    const { job_description } = req.body;
    if (!job_description || job_description.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Job description is too short (min 10 chars)' });
    }
    const parsed = searchService.parseJobDescription(job_description);
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/search/candidates - Search candidates with filters
router.get('/candidates', (req, res) => {
  try {
    const results = searchService.search(req.query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
