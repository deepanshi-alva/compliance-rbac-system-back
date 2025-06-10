const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  ctclNumber: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'rms', 'poc', 'back_office', 'it_team', 'tl', 'member'],
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: String,
    required: true
  },
  // New fields for broker and segment management
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Broker',
    required: function () {
      return this.role === 'member';
    }
  },
  segments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment'
  }],
  memberDetails: {
    joiningDate: {
      type: Date,
      default: Date.now
    },
    experience: {
      type: Number, // in years
      min: 0
    },
    specialization: {
      type: String,
      enum: ['EQUITY_TRADER', 'COMMODITY_TRADER', 'CURRENCY_TRADER', 'DERIVATIVES_TRADER', 'ANALYST', 'SUPPORT']
    },
    targetAmount: {
      type: Number,
      default: 0
    },
    salaryBroker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Broker',
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    certifications: {
      nse: {
        hasCertificate: {
          type: Boolean,
          default: false
        },
        certificateNumber: {
          type: String,
          trim: true
        },
        issueDate: {
          type: Date
        },
        expiryDate: {
          type: Date
        },
        status: {
          type: String,
          enum: ['ACTIVE', 'EXPIRED', 'PENDING', 'SUSPENDED'],
          default: 'PENDING'
        },
        documentPath: {
          type: String // Path to uploaded certificate document
        }
      },
      bse: {
        hasCertificate: {
          type: Boolean,
          default: false
        },
        certificateNumber: {
          type: String,
          trim: true
        },
        issueDate: {
          type: Date
        },
        expiryDate: {
          type: Date
        },
        status: {
          type: String,
          enum: ['ACTIVE', 'EXPIRED', 'PENDING', 'SUSPENDED'],
          default: 'PENDING'
        },
        documentPath: {
          type: String
        }
      },
      mcx: {
        hasCertificate: {
          type: Boolean,
          default: false
        },
        certificateNumber: {
          type: String,
          trim: true
        },
        issueDate: {
          type: Date
        },
        expiryDate: {
          type: Date
        },
        status: {
          type: String,
          enum: ['ACTIVE', 'EXPIRED', 'PENDING', 'SUSPENDED'],
          default: 'PENDING'
        },
        documentPath: {
          type: String
        }
      },
      // Additional certifications can be added here
      nism: {
        hasCertificate: {
          type: Boolean,
          default: false
        },
        certificateNumber: {
          type: String,
          trim: true
        },
        issueDate: {
          type: Date
        },
        expiryDate: {
          type: Date
        },
        status: {
          type: String,
          enum: ['ACTIVE', 'EXPIRED', 'PENDING', 'SUSPENDED'],
          default: 'PENDING'
        },
        documentPath: {
          type: String
        }
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPasswordChanged: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Remove duplicate indexes - only create compound indexes that don't duplicate unique fields
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ teamLead: 1 });
userSchema.index({ broker: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);