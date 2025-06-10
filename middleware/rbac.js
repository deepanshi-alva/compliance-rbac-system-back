const User = require('../models/User');
const { ROLE_HIERARCHY } = require('../config/roles');

const checkRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      if (requiredRoles.includes(user.role)) {
        req.user.role = user.role;
        return next();
      }

      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Insufficient permissions.' 
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  };
};

const canAccessUser = async (req, res, next) => {
  try {
    const requestingUser = await User.findById(req.user.id);
    const targetUserId = req.params.userId || req.body.userId;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'Target user not found' 
      });
    }

    // Super admin can access anyone
    if (requestingUser.role === 'super_admin') {
      return next();
    }

    // Users can access their own data
    if (requestingUser._id.toString() === targetUserId) {
      return next();
    }

    // Users can access their direct reports
    if (targetUser.parentId && targetUser.parentId.toString() === requestingUser._id.toString()) {
      return next();
    }

    // Members can access their TL data
    if (requestingUser.role === 'member' && 
        requestingUser.teamLead && 
        requestingUser.teamLead.toString() === targetUserId) {
      return next();
    }

    // Higher role hierarchy can access lower roles
    const requestingLevel = ROLE_HIERARCHY[requestingUser.role] || 0;
    const targetLevel = ROLE_HIERARCHY[targetUser.role] || 0;
    
    if (requestingLevel > targetLevel) {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Cannot access this user data.' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = {
  checkRole,
  canAccessUser
};