require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Company = require('../models/Company');
const User = require('../models/User');
const Document = require('../models/Document');
const Contract = require('../models/Contract');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const seedData = require('./seedData');

const runSeed = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/contractiq';
    console.log(`Connecting to MongoDB at: ${connStr}`);
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      Company.deleteMany({}),
      User.deleteMany({}),
      Document.deleteMany({}),
      Contract.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('Inserting Companies...');
    await Company.insertMany(seedData.companies);

    console.log('Hashing passwords and inserting Users...');
    const hashedUsers = await Promise.all(
      seedData.users.map(async (u) => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(u.passwordHash, salt);
        return { ...u, passwordHash: hash };
      })
    );
    await User.insertMany(hashedUsers);

    console.log('Inserting Documents...');
    await Document.insertMany(seedData.documents);

    console.log('Inserting Contracts...');
    await Contract.insertMany(seedData.contracts);

    console.log('Inserting Notifications...');
    await Notification.insertMany(seedData.notifications);

    console.log('Creating initial Audit Logs...');
    await AuditLog.insertMany([
      {
        companyId: '66b53a01f1e2a3b4c5d6e701',
        userId: '66b53b01f1e2a3b4c5d6e801',
        action: 'System Seed Initialized',
        entityType: 'Company',
        entityId: '66b53a01f1e2a3b4c5d6e701',
        metadata: { info: 'Development seed data created successfully' }
      }
    ]);

    console.log('SUCCESS: Database successfully seeded with ContractIQ sample data!');
    console.log('\n--- Sample Accounts ---');
    console.log('Admin Email:   admin@acme.com    | Password: Password123!');
    console.log('Manager Email: manager@acme.com  | Password: Password123!');
    console.log('Member Email:  member@acme.com   | Password: Password123!');
    console.log('NovaTech Admin: admin@novatech.com| Password: Password123!\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed runner failed:', error);
    process.exit(1);
  }
};

runSeed();
