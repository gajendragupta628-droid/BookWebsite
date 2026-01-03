const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const ensureAdmin = async ({ email, password }) => {
  const existing = await AdminUser.findOne({ email });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 10);
  return AdminUser.create({ email, passwordHash });
};

const login = async ({ email, password }) => {
  const user = await AdminUser.findOne({ email });
  if (!user) return null;
  const ok = await user.verifyPassword(password);
  return ok ? user : null;
};

module.exports = { ensureAdmin, login };

