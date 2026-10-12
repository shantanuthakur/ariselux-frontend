import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const oldBlock = `        <!-- LEFT: CLEAN MLT TOWER PHOTO (Seamless on pure white) -->
        <div class="about-hero-tower-col">
          <div class="about-hero-tower-wrapper">
            <img 
              id="aboutHeroTowerImg"
              src="/images/image%20for%20page/image%201.png"
              data-gif="/images/image%20for%20page/image%201.png"
              data-angle1="/images/image%20for%20page/image%202.png"
              data-angle2="/images/image%20for%20page/image%203.png"
              data-angle3="/images/image%20for%20page/image%204.png"
              alt="Ariselux industrial orange LED mobile lighting tower"
              class="about-hero-tower-img"
            >
            <div class="tower-view-switcher">
              <button type="button" class="view-btn active" data-view="gif" title="360° Rotating Motion">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Front
              </button>
              <button type="button" class="view-btn" data-view="1" title="Right-side three-quarter angle">Angle 2</button>
              <button type="button" class="view-btn" data-view="2" title="Rear three-quarter angle">Angle 3</button>
              <button type="button" class="view-btn" data-view="3" title="Straight front angle">Angle 4</button>
            </div>
          </div>
        </div>`;

const newBlock = `        <!-- LEFT: CLEAN PRO MLT TOWER SHOWCASE -->
        <div class="about-hero-tower-col">
          <div class="about-hero-tower-wrapper">
            <div class="tower-stage-container">
              <div class="tower-radial-glow" aria-hidden="true"></div>
              <img 
                id="aboutHeroTowerImg"
                src="/images/image%20for%20page/image%202.png"
                alt="Ariselux industrial orange LED mobile lighting tower"
                class="about-hero-tower-img"
                loading="eager"
              >
              <div class="tower-ground-shadow" aria-hidden="true"></div>
              <div class="tower-tech-badge badge-mast">
                <span class="badge-dot"></span>
                <span><strong>7.0M</strong> Hydraulic Mast</span>
              </div>
              <div class="tower-tech-badge badge-led">
                <span class="badge-dot"></span>
                <span><strong>4 &times; LED</strong> High-Lumen Array</span>
              </div>
            </div>
          </div>
        </div>`;

// Replace normalizing line endings
const normHtml = html.replace(/\r\n/g, '\n');
const normOld = oldBlock.replace(/\r\n/g, '\n');
const normNew = newBlock.replace(/\r\n/g, '\n');

if (!normHtml.includes(normOld)) {
  console.error('Could not find oldBlock in index.html!');
  process.exit(1);
}

const updated = normHtml.replace(normOld, normNew);
fs.writeFileSync('index.html', updated, 'utf8');
console.log('Successfully updated index.html!');
