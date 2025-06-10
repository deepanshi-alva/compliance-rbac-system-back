const express = require('express');
const router = express.Router();
const { 
  createMember, 
  getMyTeamMembers, 
  getFilteredMembers 
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create member (TL only)
router.post('/members', auth, checkRole(['tl']), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('broker').notEmpty().withMessage('Broker selection is required'),
  body('segments').isArray({ min: 1 }).withMessage('At least one segment must be selected')
], validateRequest, createMember);

// Get my team members (TL only)
router.get('/my-team', auth, checkRole(['tl']), getMyTeamMembers);

// Get filtered members (TL only)
router.get('/filtered-members', auth, checkRole(['tl']), getFilteredMembers);

module.exports = router;