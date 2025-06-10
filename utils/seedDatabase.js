const mongoose = require('mongoose');
const User = require('../models/User');
const Broker = require('../models/Broker');
const Segment = require('../models/Segment');
require('dotenv').config();

const seedSegments = [
  {
    name: 'National Stock Exchange',
    code: 'NSE',
    description: 'Leading stock exchange in India for equity trading',
    exchangeType: 'EQUITY',
    tradingHours: { start: '09:15', end: '15:30' }
  },
  {
    name: 'Bombay Stock Exchange',
    code: 'BSE',
    description: 'Asia\'s oldest stock exchange',
    exchangeType: 'EQUITY', 
    tradingHours: { start: '09:15', end: '15:30' }
  },
  {
    name: 'Multi Commodity Exchange',
    code: 'MCX',
    description: 'Leading commodity derivatives exchange',
    exchangeType: 'COMMODITY',
    tradingHours: { start: '09:00', end: '23:30' }
  },
  {
    name: 'NSE Currency',
    code: 'NSE-CD',
    description: 'Currency derivatives segment of NSE',
    exchangeType: 'CURRENCY',
    tradingHours: { start: '09:00', end: '17:00' }
  }
];

const seedBrokers = [
  {
    name: 'Zerodha',
    code: 'ZERODHA',
    description: 'India\'s largest discount broker',
    contactDetails: {
      email: 'support@zerodha.com',
      phone: '+91-80-4040-2020',
      website: 'https://zerodha.com'
    }
  },
  {
    name: 'Angel One',
    code: 'ANGEL',
    description: 'Full-service retail broking company',
    contactDetails: {
      email: 'care@angelone.in', 
      phone: '+91-22-6273-8000',
      website: 'https://angelone.in'
    }
  },
  {
    name: 'Upstox',
    code: 'UPSTOX',
    description: 'Technology-driven discount broker',
    contactDetails: {
      email: 'care@upstox.com',
      phone: '+91-22-6180-8080', 
      website: 'https://upstox.com'
    }
  },
  {
    name: 'HDFC Securities',
    code: 'HDFC-SEC',
    description: 'Full-service broker backed by HDFC Bank',
    contactDetails: {
      email: 'customercare@hdfcsec.com',
      phone: '+91-22-3075-3400',
      website: 'https://hdfcsec.com'
    }
  }
];

const seedUsers = [
  {
    employeeId: 'SA001',
    email: 'superadmin@company.com',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    department: 'Administration',
    isPasswordChanged: true
  },
  {
    employeeId: 'AD001',
    email: 'admin@company.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    department: 'Administration',
    isPasswordChanged: true
  },
  {
    employeeId: 'TL001',
    email: 'teamlead@company.com',
    password: 'temp123',
    firstName: 'Team',
    lastName: 'Lead',
    role: 'tl',
    department: 'Trading',
    isPasswordChanged: false
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rbac_dashboard');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Broker.deleteMany({});
    await Segment.deleteMany({});
    console.log('Cleared existing data');

    // Step 1: Create admin users first (they don't need broker/segments)
    console.log('Creating admin users...');
    const users = [];
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.role} - ${user.employeeId}`);
    }

    // Step 2: Create segments (need admin user for createdBy)
    console.log('Creating segments...');
    const segments = [];
    const adminUser = users.find(u => u.role === 'admin');
    
    for (const segmentData of seedSegments) {
      const segment = new Segment({
        ...segmentData,
        createdBy: adminUser._id
      });
      await segment.save();
      segments.push(segment);
      console.log(`Created segment: ${segment.name} (${segment.code})`);
    }

    // Step 3: Create brokers and assign segments
    console.log('Creating brokers...');
    const brokers = [];
    for (const brokerData of seedBrokers) {
      const broker = new Broker({
        ...brokerData,
        segments: segments.map(s => s._id), // All brokers have all segments for demo
        createdBy: adminUser._id
      });
      await broker.save();
      brokers.push(broker);
      console.log(`Created broker: ${broker.name} (${broker.code})`);
    }

    // Step 4: Create sample member users
    console.log('Creating sample members...');
    const teamLead = users.find(u => u.role === 'tl');
    
    const sampleMembers = [
      {
        employeeId: 'MEM001',
        email: 'member1@company.com',
        password: 'temp123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'member',
        parentId: teamLead._id,
        teamLead: teamLead._id,
        department: 'Trading',
        broker: brokers[0]._id, // Zerodha
        segments: [segments[0]._id, segments[1]._id], // NSE, BSE
        memberDetails: {
          experience: 2,
          specialization: 'EQUITY_TRADER',
          targetAmount: 100000,
          phone: '+91-9876543210',
          address: {
            street: '123 Trading Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          }
        },
        isPasswordChanged: false
      },
      {
        employeeId: 'MEM002',
        email: 'member2@company.com',
        password: 'temp123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'member',
        parentId: teamLead._id,
        teamLead: teamLead._id,
        department: 'Trading',
        broker: brokers[1]._id, // Angel One
        segments: [segments[2]._id], // MCX
        memberDetails: {
          experience: 3,
          specialization: 'COMMODITY_TRADER',
          targetAmount: 150000,
          phone: '+91-9876543211',
          address: {
            street: '456 Commodity Lane',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001'
          }
        },
        isPasswordChanged: false
      }
    ];

    for (const memberData of sampleMembers) {
      const member = new User(memberData);
      await member.save();
      users.push(member);
      console.log(`Created member: ${member.firstName} ${member.lastName} (${member.employeeId})`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users created: ${users.length}`);
    console.log(`🏢 Brokers created: ${brokers.length}`);
    console.log(`📈 Segments created: ${segments.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Super Admin: SA001 / admin123');
    console.log('Admin: AD001 / admin123');
    console.log('Team Lead: TL001 / temp123 (must change password)');
    console.log('Member 1: MEM001 / temp123 (must change password)');
    console.log('Member 2: MEM002 / temp123 (must change password)');
    
    console.log('\n📈 Available Segments:');
    segments.forEach(segment => {
      console.log(`  ${segment.name} (${segment.code}) - ${segment.exchangeType}`);
    });
    
    console.log('\n🏢 Available Brokers:');
    brokers.forEach(broker => {
      console.log(`  ${broker.name} (${broker.code})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();