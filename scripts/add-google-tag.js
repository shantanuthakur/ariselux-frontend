import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, '..');

const gtagSnippet = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18518316054"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8824V6WTSS"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'AW-18518316054');
    gtag('config', 'G-8824V6WTSS');
  </script>
`;

const htmlFiles = [
  'index.html',
  'about.html',
  'careers.html',
  'contact.html',
  'mobile-light-tower.html',
  'product-detail.html',
  'products.html'
];

let updatedCount = 0;

htmlFiles.forEach((file) => {
  const filePath = path.join(frontendDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Insert right after <meta name="viewport" content="width=device-width, initial-scale=1.0">
  const viewportRegex = /(<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1\.0">\r?\n)/i;

  if (content.includes('AW-18518316054') && content.includes('G-8824V6WTSS')) {
    console.log(`Tag already up-to-date in ${file}`);
    return;
  }

  if (viewportRegex.test(content)) {
    content = content.replace(viewportRegex, `$1${gtagSnippet}`);
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`✓ Added Google tag (Ads AW-18518316054 + Analytics G-8824V6WTSS) to ${file}`);
  } else {
    console.warn(`Could not find viewport in ${file}`);
  }
});

console.log(`Script finished. Files updated: ${updatedCount}`);
