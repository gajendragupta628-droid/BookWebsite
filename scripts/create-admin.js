#!/usr/bin/env node

/**
 * Create Admin User Script
 * Creates the first admin user for the dashboard
 */

const readline = require('readline');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\nMotivational Books - Admin User Creation\n');
    console.log('This script will create an admin user for the dashboard.\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is required (set it in your .env or environment).');
      process.exit(1);
    }
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB\n');

    // Define AdminUser model inline
    const AdminUserSchema = new mongoose.Schema({
      email: { type: String, unique: true, required: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });

    AdminUserSchema.methods.verifyPassword = function (password) {
      return bcrypt.compare(password, this.passwordHash);
    };

    const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

    // Get user input
    const email = await question('Enter admin email: ');
    
    if (!email || !email.includes('@')) {
      console.error('Invalid email address');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      const overwrite = await question('Admin with this email already exists. Overwrite? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
        console.log('Cancelled.');
        process.exit(0);
      }
      await AdminUser.deleteOne({ email });
    }

    const password = await question('Enter admin password (min 8 characters): ');
    
    if (!password || password.length < 8) {
      console.error('Password must be at least 8 characters');
      process.exit(1);
    }

    const confirmPassword = await question('Confirm password: ');
    
    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      process.exit(1);
    }

    // Hash password
    console.log('\nHashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = new AdminUser({
      email: email.toLowerCase().trim(),
      passwordHash
    });

    await admin.save();

    console.log('\nAdmin user created successfully!\n');
    console.log('Login Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Please keep these credentials secure!\n');
    console.log('Access the admin panel at: http://localhost:3000/admin/login\n');

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
createAdmin();
