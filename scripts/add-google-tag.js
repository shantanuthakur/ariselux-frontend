import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, '..');

const oldTagBlock = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18518316054"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8824V6WTSS"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'AW-18518316054');
    gtag('config', 'G-8824V6WTSS');
  </script>`;

const newTagBlock = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18518316054"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8824V6WTSS"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'AW-18518316054');
    gtag('config', 'G-8824V6WTSS');
  </script>
  <!-- Google tag (gtag.js) event - delayed navigation helper -->
  <script>
    // Helper function to delay opening a URL until a gtag event is sent.
    // Call it in response to an action that should navigate to a URL.
    function gtagSendEvent(url) {
      var callback = function () {
        if (typeof url === 'string') {
          window.location = url;
        }
      };
      gtag('event', 'ads_conversion_Begin_checkout_1', {
        'event_callback': callback,
        'event_timeout': 2000,
        // <event_parameters>
      });
      return false;
    }
  </script>`;

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
  const isCrlf = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  if (content.includes('gtagSendEvent')) {
    console.log(`gtagSendEvent already in ${file}`);
    return;
  }

  if (content.includes(oldTagBlock)) {
    content = content.replace(oldTagBlock, newTagBlock);
    if (isCrlf) content = content.replace(/\n/g, '\r\n');
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`✓ Added gtagSendEvent conversion helper to ${file}`);
  } else {
    console.warn(`Could not find oldTagBlock in ${file}`);
  }
});

console.log(`Successfully updated ${updatedCount} HTML pages!`);
