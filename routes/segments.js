const express = require('express');
const router = express.Router();
const { 
  getAllSegments, 
  getSegmentsByExchangeType, 
  createSegment 
} = require('../controllers/segmentController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Get all segments
router.get('/', auth, getAllSegments);

// Get segments by exchange type
router.get('/exchange/:exchangeType', auth, getSegmentsByExchangeType);

// Create segment (admin only)
router.post('/', auth, checkRole(['admin', 'super_admin']), createSegment);

module.exports = router;