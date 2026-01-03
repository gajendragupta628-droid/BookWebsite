const fs = require('fs');
const { parse } = require('csv-parse');
const xlsx = require('xlsx');

const parseCSVFile = async (filepath) => new Promise((resolve, reject) => {
  const out = [];
  fs.createReadStream(filepath).pipe(parse({ columns: true, skip_empty_lines: true }))
    .on('data', (row) => out.push(row))
    .on('end', () => resolve(out))
    .on('error', reject);
});

const parseXLSXFile = (filepath) => {
  const wb = xlsx.readFile(filepath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
};

module.exports = { parseCSVFile, parseXLSXFile };

