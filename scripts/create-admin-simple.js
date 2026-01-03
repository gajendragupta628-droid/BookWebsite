#!/usr/bin/env node

/**
 * Simple Admin User Creation Script
 * Usage: node scripts/create-admin-simple.js <email> <password>
 * Example: node scripts/create-admin-simple.js admin@bookstore.com MyPassword123
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

async function createAdmin() {
  try {
    // Get credentials from command line arguments
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error('\n❌ Usage: node scripts/create-admin-simple.js <email> <password>');
      console.error('Example: node scripts/create-admin-simple.js admin@bookstore.com MyPassword123\n');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    console.log('\n📚 Creating admin user...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Define AdminUser model
    const AdminUserSchema = new mongoose.Schema({
      email: { type: String, unique: true, required: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });

    const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('⚠️  Admin with this email already exists. Deleting old user...');
      await AdminUser.deleteOne({ email: email.toLowerCase() });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = new AdminUser({
      email: email.toLowerCase().trim(),
      passwordHash
    });

    await admin.save();

    console.log('✅ Admin user created successfully!\n');
    console.log('Login Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 Access admin panel at: http://localhost:3000/admin/login\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdmin();

