const User = require('../models/User');
const Broker = require('../models/Broker');
const Segment = require('../models/Segment');

const createMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      broker,
      segments,
      memberDetails
    } = req.body;

    // Verify the requesting user is a TL
    const teamLead = await User.findById(req.user.id);
    if (teamLead.role !== 'tl') {
      return res.status(403).json({
        success: false,
        message: 'Only Team Leads can create members'
      });
    }

    // Generate employee ID
    const memberCount = await User.countDocuments({ role: 'member' });
    const employeeId = `MEM${String(memberCount + 1).padStart(3, '0')}`;

    // Create new member
    const member = new User({
      employeeId,
      email,
      password: 'temp123', // Default password
      firstName,
      lastName,
      role: 'member',
      parentId: req.user.id,
      teamLead: req.user.id,
      department: teamLead.department,
      broker,
      segments,
      memberDetails: {
        ...memberDetails,
        joiningDate: new Date()
      },
      isPasswordChanged: false
    });

    await member.save();

    // Populate the response
    await member.populate([
      { path: 'broker', select: 'name code' },
      { path: 'segments', select: 'name code exchangeType' },
      { path: 'teamLead', select: 'firstName lastName employeeId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      member: {
        id: member._id,
        employeeId: member.employeeId,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        broker: member.broker,
        segments: member.segments,
        memberDetails: member.memberDetails,
        teamLead: member.teamLead
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creating member'
      });
    }
  }
};

const getMyTeamMembers = async (req, res) => {
  try {
    const members = await User.find({
      teamLead: req.user.id,
      role: 'member',
      isActive: true
    })
    .populate('broker', 'name code')
    .populate('segments', 'name code exchangeType')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team members'
    });
  }
};

const getFilteredMembers = async (req, res) => {
  try {
    const { broker, segment, specialization } = req.query;
    
    let filter = {
      teamLead: req.user.id,
      role: 'member',
      isActive: true
    };

    if (broker) {
      filter.broker = broker;
    }

    if (segment) {
      filter.segments = { $in: [segment] };
    }

    if (specialization) {
      filter['memberDetails.specialization'] = specialization;
    }

    const members = await User.find(filter)
      .populate('broker', 'name code')
      .populate('segments', 'name code exchangeType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      members,
      filters: { broker, segment, specialization }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching filtered members'
    });
  }
};

module.exports = {
  createMember,
  getMyTeamMembers,
  getFilteredMembers
};