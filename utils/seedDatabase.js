const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

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
    department: 'Development',
    isPasswordChanged: false
  },
  {
    employeeId: 'MEM001',
    email: 'member1@company.com',
    password: 'temp123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'member',
    department: 'Development',
    isPasswordChanged: false
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rbac_dashboard');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users
    const users = [];
    for (const userData of seedUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }

    // Set up relationships
    const teamLead = users.find(u => u.role === 'tl');
    const member = users.find(u => u.role === 'member');
    
    if (teamLead && member) {
      member.teamLead = teamLead._id;
      member.parentId = teamLead._id;
      await member.save();
    }

    console.log('Database seeded successfully');
    console.log('Default users created:');
    users.forEach(user => {
      console.log(`${user.role}: ${user.employeeId} (${user.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();