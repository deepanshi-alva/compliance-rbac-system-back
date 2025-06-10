const Broker = require('../models/Broker');
const Segment = require('../models/Segment');

const getAllBrokers = async (req, res) => {
  try {
    const brokers = await Broker.find({ isActive: true })
      .populate('segments', 'name code')
      .sort({ name: 1 });

    res.json({
      success: true,
      brokers
    });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brokers'
    });
  }
};

const createBroker = async (req, res) => {
  try {
    const { name, code, description, contactDetails, segments } = req.body;

    const broker = new Broker({
      name,
      code,
      description,
      contactDetails,
      segments,
      createdBy: req.user.id
    });

    await broker.save();

    res.status(201).json({
      success: true,
      message: 'Broker created successfully',
      broker
    });
  } catch (error) {
     console.error('Error creating broker:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Broker name or code already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creating broker'
      });
    }
  }
};

module.exports = {
  getAllBrokers,
  createBroker
};