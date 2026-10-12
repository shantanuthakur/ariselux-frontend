import fs from 'fs';

// Let's create an HTML viewer to visually see all these images side-by-side or inspect what each image contains
console.log('Testing image files');
for (let i = 1; i <= 5; i++) {
  const p = `public/images/image for page/image ${i}.png`;
  if (fs.existsSync(p)) {
    const s = fs.statSync(p);
    console.log(`image ${i}.png:`, (s.size/1024/1024).toFixed(2), 'MB');
  }
}
