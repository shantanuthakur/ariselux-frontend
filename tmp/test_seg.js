import fs from 'fs';
import zlib from 'zlib';

function testSegmentation(filePath) {
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

  // Flood fill from all 4 borders
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height * 2);
  let qHead = 0, qTail = 0;

  function isBackground(x, y) {
    const idx = (y * width + x) * bpp;
    const r = raw[idx], g = raw[idx+1], b = raw[idx+2];
    // Checkerboard squares are ~236 to 255 with r,g,b very close
    return r >= 220 && g >= 220 && b >= 220 && Math.abs(r - g) <= 8 && Math.abs(r - b) <= 8 && Math.abs(g - b) <= 8;
  }

  // Add perimeter
  for (let x = 0; x < width; x++) {
    if (isBackground(x, 0)) { visited[x] = 1; queue[qTail++] = x; queue[qTail++] = 0; }
    if (isBackground(x, height - 1)) { visited[(height - 1) * width + x] = 1; queue[qTail++] = x; queue[qTail++] = height - 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isBackground(0, y) && !visited[y * width]) { visited[y * width] = 1; queue[qTail++] = 0; queue[qTail++] = y; }
    if (isBackground(width - 1, y) && !visited[y * width + width - 1]) { visited[y * width + width - 1] = 1; queue[qTail++] = width - 1; queue[qTail++] = y; }
  }

  while (qHead < qTail) {
    const cx = queue[qHead++];
    const cy = queue[qHead++];
    const neighbors = [ [cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1] ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx] && isBackground(nx, ny)) {
          visited[nIdx] = 1;
          queue[qTail++] = nx;
          queue[qTail++] = ny;
        }
      }
    }
  }

  console.log('Total pixels:', width * height, 'Background filled:', qTail / 2, 'Percentage:', ((qTail / 2) / (width * height) * 100).toFixed(1) + '%');
  return { width, height, raw, visited, bpp };
}

testSegmentation('public/images/image for page/image 2.png');
