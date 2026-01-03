const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const ensureAdmin = async ({ email, password, forcePassword = false }) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await AdminUser.findOne({ email: normalizedEmail });
  if (existing) {
    if (forcePassword && typeof password === 'string' && password.length > 0) {
      const ok = await existing.verifyPassword(password);
      if (!ok) {
        existing.passwordHash = await bcrypt.hash(password, 10);
        await existing.save();
      }
    }
    return existing;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  return AdminUser.create({ email: normalizedEmail, passwordHash });
};

const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await AdminUser.findOne({ email: normalizedEmail });
  if (!user) return null;
  const ok = await user.verifyPassword(password);
  return ok ? user : null;
};

module.exports = { ensureAdmin, login };
