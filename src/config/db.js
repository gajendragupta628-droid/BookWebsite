const mongoose = require('mongoose');
const { env } = require('./env');

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

// Handle connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
  connectionAttempts = 0;
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  }
});

const connectDB = async (retries = 0) => {
  try {
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    isConnected = true;
    connectionAttempts = 0;
    return true;
  } catch (error) {
    connectionAttempts++;
    isConnected = false;
    
    if (retries < MAX_RETRIES) {
      console.error(`MongoDB connection failed (attempt ${retries + 1}/${MAX_RETRIES}):`, error.message);
      console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries + 1);
    } else {
      console.error('❌ Failed to connect to MongoDB after', MAX_RETRIES, 'attempts');
      console.error('Error:', error.message);
      console.error('\nPlease check:');
      console.error('  1. MongoDB is running');
      console.error('  2. MONGODB_URI is correct in your .env file');
      console.error('  3. Network connectivity to MongoDB server\n');
      throw error;
    }
  }
};

const getConnectionStatus = () => ({
  isConnected: isConnected || mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host,
  name: mongoose.connection.name
});

module.exports = { connectDB, getConnectionStatus };

