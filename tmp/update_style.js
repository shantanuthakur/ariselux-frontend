import fs from 'fs';

let css = fs.readFileSync('src/style.css', 'utf8').replace(/\r\n/g, '\n');

const oldTarget = `/* ── About Hero Showcase (Clean White Catalog Style matching user reference) ── */
.about-hero-showcase-section {
  background: #ffffff;
  padding: 40px 0 50px;
  position: relative;
  overflow: hidden;
}

.about-hero-grid {
  display: grid;
  grid-template-columns: 48% 52%;
  gap: 40px;
  align-items: center;
}

.about-hero-tower-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: transparent;
  perspective: 1200px;
  transform-style: preserve-3d;
}

@media (min-width: 1200px) {
  .about-hero-tower-col {
    margin-left: -50px; /* Bleed left like lightingtowers.in .prodlightleft */
  }
}

.about-hero-tower-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.about-hero-tower-img {
  width: 100%;
  max-width: 660px;
  height: auto;
  max-height: 780px;
  object-fit: contain;
  display: block;
  background: transparent;
  /* Pure alpha transparency - NO mix-blend-mode to avoid grey boxes */
  filter: drop-shadow(0 20px 35px rgba(0, 0, 0, 0.12));
  will-change: transform;
  transform-origin: center center;
  transition: opacity 0.25s ease;
}

/* Sleek View Switcher Pills under the tower */
.tower-view-switcher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 6px 10px;
  background: rgba(245, 245, 247, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  z-index: 5;
}

.tower-view-switcher .view-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #555555;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tower-view-switcher .view-btn:hover {
  color: #111111;
  background: rgba(0, 0, 0, 0.05);
}

.tower-view-switcher .view-btn.active {
  background: #000000;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.tower-view-switcher .view-btn.active svg {
  stroke: var(--accent, #F47920);
}`;

const newTarget = `/* ── About Hero Showcase (Clean Professional Catalog Style) ── */
.about-hero-showcase-section {
  background: #ffffff;
  padding: 50px 0 60px;
  position: relative;
  overflow: visible;
}

.about-hero-grid {
  display: grid;
  grid-template-columns: 48% 52%;
  gap: 40px;
  align-items: center;
}

.about-hero-tower-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: transparent;
  perspective: 1200px;
  transform-style: preserve-3d;
}

@media (min-width: 1200px) {
  .about-hero-tower-col {
    margin-left: 0;
  }
}

.about-hero-tower-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tower-stage-container {
  position: relative;
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 10px 30px;
}

/* Subtle showroom studio vignette glow */
.tower-radial-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95%;
  height: 90%;
  background: radial-gradient(ellipse at center, rgba(244, 121, 32, 0.07) 0%, rgba(27, 95, 170, 0.04) 40%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
  z-index: 1;
}

.about-hero-tower-img {
  width: 100%;
  max-width: 520px;
  height: auto;
  max-height: 640px;
  object-fit: contain;
  display: block;
  background: transparent;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.09));
  will-change: transform;
  transform-origin: center bottom;
  transition: transform 0.25s ease-out;
}

/* Ground contact shadow underneath wheels & outriggers */
.tower-ground-shadow {
  position: relative;
  z-index: 1;
  width: 80%;
  height: 22px;
  margin-top: -10px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.07) 50%, rgba(0, 0, 0, 0) 75%);
  filter: blur(4px);
  border-radius: 50%;
  pointer-events: none;
}

/* Sleek floating technical micro-badges */
.tower-tech-badge {
  position: absolute;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  font-size: 12.5px;
  color: #1e293b;
  font-weight: 500;
  pointer-events: none;
  animation: techBadgeFloat 4s ease-in-out infinite alternate;
}

.tower-tech-badge .badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent, #F47920);
  box-shadow: 0 0 8px rgba(244, 121, 32, 0.6);
  display: inline-block;
}

.tower-tech-badge.badge-mast {
  top: 12%;
  right: 5%;
}

.tower-tech-badge.badge-led {
  top: 3%;
  left: 3%;
  animation-delay: -2s;
}

@keyframes techBadgeFloat {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-4px); }
}`;

if (!css.includes(oldTarget)) {
  console.error('Target not found in src/style.css!');
  process.exit(1);
}

css = css.replace(oldTarget, newTarget);
fs.writeFileSync('src/style.css', css, 'utf8');
console.log('Successfully updated src/style.css!');
