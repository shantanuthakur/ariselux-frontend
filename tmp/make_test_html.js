import fs from 'fs';

// Let's create an HTML file that renders all candidates so we can examine their dimensions, aspect ratios, etc.
const html = `
<!DOCTYPE html>
<html>
<head>
<title>Image Audit</title>
<style>
  body { font-family: sans-serif; background: #222; color: #fff; padding: 20px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
  .card { background: #333; border-radius: 8px; padding: 10px; text-align: center; }
  .img-box { width: 100%; height: 300px; background: #fff; display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden; }
  .img-box.checker { background: repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 20px 20px; }
  img { max-width: 100%; max-height: 100%; object-fit: contain; }
  h4 { margin: 10px 0 5px; font-size: 14px; word-break: break-all; }
  p { font-size: 12px; color: #aaa; margin: 0; }
</style>
</head>
<body>
<h1>Image Comparison</h1>
<div class="grid">
  <div class="card">
    <div class="img-box"><img src="/images/image for page/image 1.png"></div>
    <h4>image for page / image 1.png</h4>
  </div>
  <div class="card">
    <div class="img-box"><img src="/images/image for page/image 2.png"></div>
    <h4>image for page / image 2.png (Angle 2)</h4>
  </div>
  <div class="card">
    <div class="img-box"><img src="/images/image for page/image 3.png"></div>
    <h4>image for page / image 3.png (Angle 3)</h4>
  </div>
  <div class="card">
    <div class="img-box"><img src="/images/image for page/image 4.png"></div>
    <h4>image for page / image 4.png (Angle 4)</h4>
  </div>
  <div class="card">
    <div class="img-box"><img src="/images/image for page/image 5.png"></div>
    <h4>image for page / image 5.png</h4>
  </div>
  <div class="card">
    <div class="img-box checker"><img src="/images/products/Diesel oprated/ace-lt-6000-transparent-1.png"></div>
    <h4>Diesel / ace-lt-6000-transparent-1.png</h4>
  </div>
  <div class="card">
    <div class="img-box checker"><img src="/images/products/Diesel oprated/ace-lt-6000-transparent-2.png"></div>
    <h4>Diesel / ace-lt-6000-transparent-2.png</h4>
  </div>
  <div class="card">
    <div class="img-box checker"><img src="/images/products/Diesel oprated/ace-lt-6000-transparent-3.png"></div>
    <h4>Diesel / ace-lt-6000-transparent-3.png</h4>
  </div>
  <div class="card">
    <div class="img-box"><img src="/images/products/Diesel oprated/ACE LT 6000 -1.png"></div>
    <h4>Diesel / ACE LT 6000 -1.png</h4>
  </div>
  <div class="card">
    <div class="img-box"><img src="/images/products/Diesel oprated/ACE LT 6000 -2.png"></div>
    <h4>Diesel / ACE LT 6000 -2.png</h4>
  </div>
  <div class="card">
    <div class="img-box"><img src="/images/products/Diesel oprated/ACE LT 6000 -3.png"></div>
    <h4>Diesel / ACE LT 6000 -3.png</h4>
  </div>
  <div class="card">
    <div class="img-box checker"><img src="/images/products/Diesel oprated/ace-lt-6000-rotation.webp"></div>
    <h4>Diesel / ace-lt-6000-rotation.webp</h4>
  </div>
</div>
</body>
</html>
`;

fs.writeFileSync('public/test-images.html', html);
console.log('Saved public/test-images.html');
