const express = require('express');
const router = express.Router();
const { getAllBrokers, createBroker } = require('../controllers/brokerController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Get all brokers
router.get('/', auth, getAllBrokers);

// Create broker (admin only)
router.post('/', auth, checkRole(['admin', 'super_admin']), createBroker);

module.exports = router;