import fs from 'fs';
import zlib from 'zlib';

function analyzePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width, height, colorType;
  let idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString();
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
      colorType = buf[pos + 17];
    } else if (type === 'IDAT') {
      idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = colorType === 6 ? 4 : 3;
  const raw = Buffer.alloc(width * height * bpp);
  const stride = 1 + width * bpp;

  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * stride];
    const prevRow = y > 0 ? (y - 1) * width * bpp : -1;
    const curRow = y * width * bpp;
    for (let x = 0; x < width * bpp; x++) {
      const cur = decompressed[y * stride + 1 + x];
      const a = x >= bpp ? raw[curRow + x - bpp] : 0;
      const b = prevRow >= 0 ? raw[prevRow + x] : 0;
      const c = (prevRow >= 0 && x >= bpp) ? raw[prevRow + x - bpp] : 0;
      let val = cur;
      if (filter === 1) val = (cur + a) & 0xff;
      else if (filter === 2) val = (cur + b) & 0xff;
      else if (filter === 3) val = (cur + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) val = (cur + paeth(a, b, c)) & 0xff;
      raw[curRow + x] = val;
    }
  }

  console.log('Decoded successfully! Size:', width, 'x', height);
  // Check the checkerboard: what are the colors in the top-left 50x50?
  let colorMap = {};
  for (let y = 0; y < 60; y++) {
    for (let x = 0; x < 60; x++) {
      const idx = (y * width + x) * bpp;
      const key = `${raw[idx]},${raw[idx+1]},${raw[idx+2]}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }
  }
  console.log('Top left 60x60 colors:', Object.entries(colorMap).sort((a,b)=>b[1]-a[1]).slice(0, 10));
}

analyzePNG('public/images/image for page/image 2.png');
