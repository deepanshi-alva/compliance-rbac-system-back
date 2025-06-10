const Segment = require('../models/Segment');

const getAllSegments = async (req, res) => {
  try {
    const segments = await Segment.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      segments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching segments'
    });
  }
};

const getSegmentsByExchangeType = async (req, res) => {
  try {
    const { exchangeType } = req.params;
    
    const segments = await Segment.find({ 
      exchangeType: exchangeType.toUpperCase(), 
      isActive: true 
    }).sort({ name: 1 });

    res.json({
      success: true,
      segments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching segments'
    });
  }
};

const createSegment = async (req, res) => {
  try {
    const { name, code, description, exchangeType, tradingHours } = req.body;

    const segment = new Segment({
      name,
      code,
      description,
      exchangeType,
      tradingHours,
      createdBy: req.user.id
    });

    await segment.save();

    res.status(201).json({
      success: true,
      message: 'Segment created successfully',
      segment
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Segment name or code already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creating segment'
      });
    }
  }
};

module.exports = {
  getAllSegments,
  getSegmentsByExchangeType,
  createSegment
};