import fs from 'fs';

let css = fs.readFileSync('src/style.css', 'utf8').replace(/\r\n/g, '\n');

const toRemove = `/* Sleek floating technical micro-badges */
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

if (!css.includes(toRemove)) {
  console.error('Badge CSS not found in src/style.css!');
  process.exit(1);
}

css = css.replace(toRemove, '');
fs.writeFileSync('src/style.css', css, 'utf8');
console.log('Successfully cleaned badge CSS from src/style.css!');
