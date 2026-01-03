const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const uploader = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const processImage = async (filepath) => {
  const fileName = path.basename(filepath, path.extname(filepath));
  const outBase = path.join(uploadDir, fileName);
  const sizes = [400, 800, 1200];
  const outputs = [];
  for (const w of sizes) {
    const outPath = `${outBase}_${w}.webp`;
    await sharp(filepath).resize({ width: w }).webp({ quality: 82 }).toFile(outPath);
    outputs.push(path.join('/public/uploads', path.basename(outPath)));
  }
  return outputs;
};

module.exports = { uploader, processImage };

