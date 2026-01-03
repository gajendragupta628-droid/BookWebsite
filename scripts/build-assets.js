const fs = require('fs');
const path = require('path');

const ensureDirs = () => {
  const dirs = [
    path.join(__dirname, '..', 'src', 'public', 'uploads'),
  ];
  dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
};

ensureDirs();
console.log('Assets prepared');

