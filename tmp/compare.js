import fs from 'fs';

const f1 = fs.readFileSync('public/images/company/ariselux-mlt-tower-4k.png');
const f2 = fs.readFileSync('public/images/image for page/image 1.png');

console.log('f1 length:', f1.length, 'f2 length:', f2.length);
console.log('Equal:', f1.equals(f2));
