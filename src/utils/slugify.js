const slugifyLib = require('slugify');

const slugify = (str) => slugifyLib(str || '', { lower: true, strict: true, trim: true });

module.exports = { slugify };

