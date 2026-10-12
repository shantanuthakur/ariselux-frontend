import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const typeAndData = buf.slice(4, 8 + len);
  buf.writeUInt32BE(crc32(typeAndData), 8 + len);
  return buf;
}

function encodePNG(width, height, rgbaBuffer) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // colorType 6 = RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines with filter 0
  const stride = 1 + width * 4;
  const scanlines = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    scanlines[y * stride] = 0; // filter 0 (None)
    rgbaBuffer.copy(scanlines, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function cleanImage2(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
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

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height * 2);
  let qHead = 0, qTail = 0;

  function isChecker(x, y) {
    const idx = (y * width + x) * bpp;
    const r = raw[idx], g = raw[idx+1], b = raw[idx+2];
    return r >= 215 && g >= 215 && b >= 215 && Math.abs(r - g) <= 10 && Math.abs(r - b) <= 10 && Math.abs(g - b) <= 10;
  }

  // Flood fill from outer edges
  for (let x = 0; x < width; x++) {
    if (isChecker(x, 0)) { visited[x] = 1; queue[qTail++] = x; queue[qTail++] = 0; }
    if (isChecker(x, height - 1)) { visited[(height - 1) * width + x] = 1; queue[qTail++] = x; queue[qTail++] = height - 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isChecker(0, y) && !visited[y * width]) { visited[y * width] = 1; queue[qTail++] = 0; queue[qTail++] = y; }
    if (isChecker(width - 1, y) && !visited[y * width + width - 1]) { visited[y * width + width - 1] = 1; queue[qTail++] = width - 1; queue[qTail++] = y; }
  }

  while (qHead < qTail) {
    const cx = queue[qHead++];
    const cy = queue[qHead++];
    const neighbors = [ [cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1] ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx] && isChecker(nx, ny)) {
          visited[nIdx] = 1;
          queue[qTail++] = nx;
          queue[qTail++] = ny;
        }
      }
    }
  }

  // Also fill internal checkerboard regions between brackets
  // Any unvisited checkerboard pixel whose contiguous block is checkerboard
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && isChecker(x, y)) {
        // Only if it's near the mast (y < height * 0.55)
        if (y < height * 0.55) {
          visited[idx] = 1;
        }
      }
    }
  }

  // Build RGBA output
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const inIdx = pIdx * bpp;
      const outIdx = pIdx * 4;
      if (visited[pIdx]) {
        // Completely transparent
        rgba[outIdx] = 0;
        rgba[outIdx + 1] = 0;
        rgba[outIdx + 2] = 0;
        rgba[outIdx + 3] = 0;
      } else {
        rgba[outIdx] = raw[inIdx];
        rgba[outIdx + 1] = raw[inIdx + 1];
        rgba[outIdx + 2] = raw[inIdx + 2];
        rgba[outIdx + 3] = 255;
      }
    }
  }

  const png = encodePNG(width, height, rgba);
  fs.writeFileSync(outputPath, png);
  console.log('Saved cleaned PNG to', outputPath, 'size:', png.length);
}

cleanImage2('public/images/image for page/image 2.png', 'public/images/image for page/image 2-cleaned.png');
