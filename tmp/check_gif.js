import fs from 'fs';

const gif = fs.readFileSync('public/images/products/Diesel oprated/ace-lt-6000-rotation.gif');
console.log('GIF header:', gif.slice(0, 6).toString());
const w = gif.readUInt16LE(6);
const h = gif.readUInt16LE(8);
console.log('GIF size:', w, 'x', h);

const webp = fs.readFileSync('public/images/products/Diesel oprated/ace-lt-6000-rotation.webp');
console.log('WEBP size:', webp.length, 'bytes');
