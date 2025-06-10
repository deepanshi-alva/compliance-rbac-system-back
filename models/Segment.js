const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  exchangeType: {
    type: String,
    enum: ['EQUITY', 'COMMODITY', 'CURRENCY', 'DERIVATIVES'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tradingHours: {
    start: String,
    end: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Only create compound indexes that don't duplicate unique fields
segmentSchema.index({ name: 1, isActive: 1 });
segmentSchema.index({ exchangeType: 1 });

module.exports = mongoose.model('Segment', segmentSchema);