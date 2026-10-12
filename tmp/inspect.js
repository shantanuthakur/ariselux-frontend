import fs from 'fs';

function inspect(file) {
  if (!fs.existsSync(file)) return { file, error: 'not found' };
  const buf = fs.readFileSync(file);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const col = buf[25];
  return { file, w, h, col, sizeMB: (buf.length / 1024 / 1024).toFixed(2) };
}

const list = [
  'public/images/image for page/image 1.png',
  'public/images/image for page/image 2.png',
  'public/images/image for page/image 3.png',
  'public/images/image for page/image 4.png',
  'public/images/image for page/image 5.png',
  'public/images/products/Diesel oprated/ACE LT 6000 -1.png',
  'public/images/products/Diesel oprated/ACE LT 6000 -2.png',
  'public/images/products/Diesel oprated/ACE LT 6000 -3.png',
  'public/images/products/Diesel oprated/ace-lt-6000-transparent-1.png',
  'public/images/products/Diesel oprated/ace-lt-6000-transparent-2.png',
  'public/images/products/Diesel oprated/ace-lt-6000-transparent-3.png',
  'public/images/company/ariselux-mlt-tower-4k.png'
];

console.log(JSON.stringify(list.map(inspect), null, 2));
