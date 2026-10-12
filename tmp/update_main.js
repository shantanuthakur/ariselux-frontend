import fs from 'fs';

let js = fs.readFileSync('src/main.js', 'utf8').replace(/\r\n/g, '\n');

const oldCode = `// ─── TOWER IMAGE: Float + 3D Mouse-Tracking Parallax Tilt & View Switcher ────
(function initTowerMotion() {
  const towerCol = document.querySelector('.about-hero-tower-col');
  const towerImg = document.getElementById('aboutHeroTowerImg') || document.querySelector('.about-hero-tower-img');
  if (!towerCol || !towerImg) return;

  const section = document.querySelector('.about-hero-showcase-section');
  if (!section) return;

  let targetRX = 0, targetRY = 0;
  let currentRX = 0, currentRY = 0;
  let isHovering = false;
  let startTime = Date.now();

  const MAX_TILT = 11; // degrees max tilt
  const LERP = 0.08;   // smoothing factor

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    currentRX = lerp(currentRX, targetRX, LERP);
    currentRY = lerp(currentRY, targetRY, LERP);

    // Continuous floating sine wave
    const elapsed = (Date.now() - startTime) * 0.0018;
    const floatY = isHovering ? 0 : Math.sin(elapsed) * 12;
    const scale = isHovering ? 1.03 : 1.0;

    towerImg.style.transform = \`
      perspective(1000px)
      translateY(\${floatY.toFixed(2)}px)
      rotateX(\${currentRX.toFixed(2)}deg)
      rotateY(\${currentRY.toFixed(2)}deg)
      scale(\${scale})
    \`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  section.addEventListener('mousemove', (e) => {
    isHovering = true;
    const rect = towerCol.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    targetRY = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * MAX_TILT));
    targetRX = Math.max(-MAX_TILT, Math.min(MAX_TILT, -dy * MAX_TILT * 0.6));
  }, { passive: true });

  section.addEventListener('mouseleave', () => {
    isHovering = false;
    targetRX = 0;
    targetRY = 0;
  });

  // View Switcher (360 GIF vs Angles)
  const buttons = document.querySelectorAll('.tower-view-switcher .view-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.getAttribute('data-view');
      let nextSrc = towerImg.getAttribute('data-gif');
      if (view === '1') nextSrc = towerImg.getAttribute('data-angle1');
      else if (view === '2') nextSrc = towerImg.getAttribute('data-angle2');
      else if (view === '3') nextSrc = towerImg.getAttribute('data-angle3');

      if (nextSrc && towerImg.src !== nextSrc) {
        towerImg.style.opacity = '0.3';
        setTimeout(() => {
          towerImg.src = nextSrc;
          towerImg.style.opacity = '1';
        }, 120);
      }
    });
  });
})();`;

const newCode = `// ─── TOWER IMAGE: Professional Grounded Stance + Smooth 3D Mouse Parallax ────
(function initTowerMotion() {
  const towerCol = document.querySelector('.about-hero-tower-col');
  const towerImg = document.getElementById('aboutHeroTowerImg') || document.querySelector('.about-hero-tower-img');
  if (!towerCol || !towerImg) return;

  const section = document.querySelector('.about-hero-showcase-section');
  if (!section) return;

  let targetRX = 0, targetRY = 0;
  let currentRX = 0, currentRY = 0;
  let isHovering = false;

  const MAX_TILT = 5.5; // subtle, high-end industrial tilt
  const LERP = 0.08;    // smooth response

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    currentRX = lerp(currentRX, targetRX, LERP);
    currentRY = lerp(currentRY, targetRY, LERP);

    const scale = isHovering ? 1.02 : 1.0;

    towerImg.style.transform = \`
      perspective(1100px)
      rotateX(\${currentRX.toFixed(2)}deg)
      rotateY(\${currentRY.toFixed(2)}deg)
      scale(\${scale})
    \`;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  section.addEventListener('mousemove', (e) => {
    isHovering = true;
    const rect = towerCol.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    targetRY = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * MAX_TILT));
    targetRX = Math.max(-MAX_TILT, Math.min(MAX_TILT, -dy * MAX_TILT * 0.5));
  }, { passive: true });

  section.addEventListener('mouseleave', () => {
    isHovering = false;
    targetRX = 0;
    targetRY = 0;
  });
})();`;

if (!js.includes(oldCode)) {
  console.error('Old code not found in src/main.js!');
  process.exit(1);
}

js = js.replace(oldCode, newCode);
fs.writeFileSync('src/main.js', js, 'utf8');
console.log('Successfully updated src/main.js!');
