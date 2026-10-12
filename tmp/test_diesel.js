import fs from 'fs';

// Let's inspect the 3 images in Diesel oprated
const f1 = fs.statSync('public/images/products/Diesel oprated/ACE LT 6000 -1.png');
const f2 = fs.statSync('public/images/products/Diesel oprated/ACE LT 6000 -2.png');
const f3 = fs.statSync('public/images/products/Diesel oprated/ACE LT 6000 -3.png');

console.log('ACE LT 6000 -1:', f1.size);
console.log('ACE LT 6000 -2:', f2.size);
console.log('ACE LT 6000 -3:', f3.size);
