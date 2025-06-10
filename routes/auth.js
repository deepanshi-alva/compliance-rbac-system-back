const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

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

// Login route
router.post('/login', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], validateRequest, authController.login);

// Get current user
router.get('/me', auth, authController.getMe);

// Change password
router.post('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validateRequest, authController.changePassword);

module.exports = router;