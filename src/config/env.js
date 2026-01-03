const dotenv = require('dotenv');
const path = require('path');

// Load `.env` from the project root regardless of the current working directory.
// This avoids accidentally falling back to defaults when the app is started from `src/` (or elsewhere).
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, '../../.env') });

const DEFAULT_ADMIN_EMAIL = 'admin@bookstore.com';
const DEFAULT_ADMIN_PASSWORD = 'SecurePass123!';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGODB_URI: process.env.MONGODB_URI,
  SESSION_SECRET: process.env.SESSION_SECRET || 'change_me',
  STORE_NAME: process.env.STORE_NAME || 'Motivational Books',
  STORE_CURRENCY: process.env.STORE_CURRENCY || process.env.CURRENCY || 'USD',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '0', 10) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  // Used to bootstrap a default admin user in development, and optionally in production if explicitly set.
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
  BASE_URL: process.env.BASE_URL || process.env.SITE_URL || 'http://localhost:3000',
  TRUST_PROXY: (process.env.TRUST_PROXY || '').toLowerCase() === 'true',
  ENABLE_COD: (process.env.ENABLE_COD || 'true') === 'true',
  PEXELS_API_KEY: process.env.PEXELS_API_KEY || '',
  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || process.env.API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET || '',
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
};

// Validate required environment variables
function validateEnv() {
  const errors = [];
  const isProduction = env.NODE_ENV === 'production';

  // Critical for all environments
  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required');
  }

  // Critical for production
  if (isProduction) {
    if (!process.env.SESSION_SECRET || env.SESSION_SECRET === 'change_me') {
      errors.push('SESSION_SECRET must be set to a secure random string in production (use: openssl rand -hex 32)');
    }
    if (env.SESSION_SECRET.length < 32) {
      errors.push('SESSION_SECRET must be at least 32 characters long in production');
    }

    // If admin bootstrap variables are used in production, enforce they are explicitly set and not defaults.
    const adminEmailExplicit = typeof process.env.ADMIN_EMAIL === 'string' && process.env.ADMIN_EMAIL.trim() !== '';
    const adminPasswordExplicit = typeof process.env.ADMIN_PASSWORD === 'string' && process.env.ADMIN_PASSWORD.trim() !== '';
    if (adminEmailExplicit !== adminPasswordExplicit) {
      errors.push('ADMIN_EMAIL and ADMIN_PASSWORD must be set together (or both omitted)');
    }
    if (adminEmailExplicit && env.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) {
      errors.push('ADMIN_PASSWORD must be changed from the default in production');
    }
  }

  // Warn about missing optional but recommended vars
  const warnings = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    warnings.push('Cloudinary credentials not configured - image uploads will not work');
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    warnings.push('SMTP not configured - email notifications will not work');
  }

  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Validation Failed:\n');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease fix these issues before starting the application.\n');
    process.exit(1);
  }

  if (warnings.length > 0 && !isProduction) {
    console.warn('\n⚠️  Environment Variable Warnings:\n');
    warnings.forEach(warn => console.warn(`  - ${warn}`));
    console.warn('');
  }
}

// Validation will be called explicitly from server.js

module.exports = { env, validateEnv };
