import fs from 'fs';
import path from 'path';

function findImages(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      res.push(...findImages(full));
    } else if (/\.(png|jpe?g|webp|gif)$/i.test(file)) {
      res.push(full);
    }
  });
  return res;
}

const all = findImages('public/images/products');
console.log(all);
