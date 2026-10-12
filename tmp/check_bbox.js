import fs from 'fs';
import zlib from 'zlib';

function checkImage(file) {
  const buf = fs.readFileSync(file);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const col = buf[25];
  
  // Find IDAT
  let pos = 8;
  let idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString();
    if (type === 'IDAT') {
      idat.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  
  const decompressed = zlib.inflateSync(Buffer.concat(idat));
  const bpp = col === 6 ? 4 : 3;
  const stride = 1 + w * bpp;
  
  // Let's count alpha values if col === 6
  if (col === 6) {
    let transparentCount = 0;
    let solidCount = 0;
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let y = 0; y < h; y += 4) { // sample every 4 rows
      for (let x = 0; x < w; x += 4) {
        // filter 0 check approx
        const a = decompressed[y * stride + 1 + x * 4 + 3];
        if (a < 20) {
          transparentCount++;
        } else {
          solidCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { file, w, h, transparentCount, solidCount, boundingBox: { minX, maxX, minY, maxY } };
  } else {
    return { file, w, h, col };
  }
}

console.log(checkImage('public/images/products/Diesel oprated/ACE LT 6000 -1.png'));
console.log(checkImage('public/images/products/Diesel oprated/ACE LT 6000 -2.png'));
console.log(checkImage('public/images/products/Diesel oprated/ACE LT 6000 -3.png'));
console.log(checkImage('public/images/products/Diesel oprated/ace-lt-6000-transparent-1.png'));
console.log(checkImage('public/images/products/Diesel oprated/ace-lt-6000-transparent-2.png'));
console.log(checkImage('public/images/products/Diesel oprated/ace-lt-6000-transparent-3.png'));
