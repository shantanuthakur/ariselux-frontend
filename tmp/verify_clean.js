import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync('public/images/image for page/image 2-cleaned.png');
// parse and check transparent vs non-transparent
let pos = 8;
let idat = [];
let width, height;
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString();
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
  } else if (type === 'IDAT') {
    idat.push(buf.slice(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}
const decompressed = zlib.inflateSync(Buffer.concat(idat));
let semiTransparent = 0, fullyTransparent = 0, opaque = 0;
for (let y = 0; y < height; y++) {
  const rowStart = y * (1 + width * 4) + 1;
  for (let x = 0; x < width; x++) {
    const a = decompressed[rowStart + x * 4 + 3];
    if (a === 0) fullyTransparent++;
    else if (a === 255) opaque++;
    else semiTransparent++;
  }
}
console.log({ width, height, fullyTransparent, opaque, semiTransparent });
