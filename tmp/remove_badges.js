import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const oldBlock = `              <div class="tower-ground-shadow" aria-hidden="true"></div>
              <div class="tower-tech-badge badge-mast">
                <span class="badge-dot"></span>
                <span><strong>7.0M</strong> Hydraulic Mast</span>
              </div>
              <div class="tower-tech-badge badge-led">
                <span class="badge-dot"></span>
                <span><strong>4 &times; LED</strong> High-Lumen Array</span>
              </div>`;

const newBlock = `              <div class="tower-ground-shadow" aria-hidden="true"></div>`;

const normHtml = html.replace(/\r\n/g, '\n');
const normOld = oldBlock.replace(/\r\n/g, '\n');
const normNew = newBlock.replace(/\r\n/g, '\n');

if (!normHtml.includes(normOld)) {
  console.error('Old block not found in index.html!');
  process.exit(1);
}

const updated = normHtml.replace(normOld, normNew);
fs.writeFileSync('index.html', updated, 'utf8');
console.log('Successfully removed badges from index.html!');
