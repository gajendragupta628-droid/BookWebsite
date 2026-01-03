const getPagination = (page = 1, perPage = 12) => {
  const p = Math.max(1, parseInt(page || '1', 10));
  const limit = Math.max(1, Math.min(parseInt(perPage || '12', 10), 100));
  const skip = (p - 1) * limit;
  return { page: p, perPage: limit, skip, limit };
};

module.exports = { getPagination };

