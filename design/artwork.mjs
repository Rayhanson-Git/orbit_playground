// Draws the README artwork for Orbit Playground into ../assets.
// Run from design/: npm install && npm run build
import { C, F, text, paragraph, label, svg, frame, arrow, key, write, r2, REDUCED } from './lib.mjs';

// The three palettes, as defined in sketch.js.
const ROSE = 'rgb(220,70,135)', VIOLET = 'rgb(170,140,255)', MINT = 'rgb(120,255,190)';

// A tiny seeded random, so the artwork is the same on every build.
let seed = 11;
const rand = (a = 0, b = 1) => { seed = (seed * 16807) % 2147483647; return a + ((seed - 1) / 2147483646) * (b - a); };

// ------------------------------------------------------------------ hero
function hero(H = 440, file = 'assets/hero.svg') {
  const W = 1280;
  const dy = (H - 440) / 2;
  const style = `.spin{transform-box:view-box;animation:spin linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.glow{animation:glow 3.2s ease-in-out infinite}@keyframes glow{0%,100%{opacity:.35}50%{opacity:.8}}${REDUCED}`;
  let orbits = '';
  const centres = [[930, 210 + dy, ROSE], [1105, 300 + dy, VIOLET], [800, 330 + dy, MINT], [1150, 120 + dy, ROSE]];
  seed = 11;
  centres.forEach(([cx, cy, col], ci) => {
    orbits += `<circle cx="${cx}" cy="${cy}" r="3" fill="${C.ink}" opacity=".9"/>`;
    const n = ci === 0 ? 7 : 4;
    for (let i = 0; i < n; i++) {
      const r = r2(rand(22, ci === 0 ? 150 : 90));
      const size = r2(rand(4, 11));
      const dur = r2(rand(9, 26));
      const start = r2(rand(0, 360));
      orbits += `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${C.rule}" stroke-width="1"/>`;
      orbits += `<g class="spin" style="transform-origin:${cx}px ${cy}px;animation-duration:${dur}s;animation-delay:-${r2(dur * start / 360)}s">` +
        `<path d="M${r2(cx + r)} ${cy}A${r} ${r} 0 0 0 ${r2(cx + r * Math.cos(-0.9))} ${r2(cy + r * Math.sin(-0.9))}" stroke="${col}" stroke-width="${r2(size * 0.7)}" stroke-linecap="round" opacity=".22"/>` +
        `<circle cx="${r2(cx + r)}" cy="${cy}" r="${r2(size * 1.3)}" fill="${col}" opacity=".18"/>` +
        `<circle cx="${r2(cx + r)}" cy="${cy}" r="${r2(size / 2)}" fill="${col}"/>` +
        `<circle cx="${r2(cx + r)}" cy="${cy}" r="${r2(size * 0.2)}" fill="#fff" opacity=".5"/></g>`;
    }
  });
  // faint background stars
  let stars = '';
  for (let i = 0; i < 70; i++) stars += `<circle cx="${r2(rand(20, W - 20))}" cy="${r2(rand(20, H - 20))}" r="${r2(rand(0.5, 1.4))}" fill="${C.ice}" opacity="${r2(rand(0.1, 0.35))}"/>`;

  const body = frame(W, H) + stars +
    `<g clip-path="url(#clip)">${orbits}</g>` +
    label('Generative interaction · p5.js · 2025', { x: 64, y: 118 + dy }) +
    text('Orbit Playground', { font: F.display, size: 62, x: 62, y: 190 + dy, fill: C.ink }) +
    paragraph('Click a point and set a small universe in motion. Every click is a new centre of gravity; colour and speed decide whether it feels quiet, playful or restless.', { x: 64, y: 240 + dy, width: 520, size: 19, fill: C.ink2 }).svg +
    label('Click · Hold · 1 2 3 · ↑ ↓', { x: 64, y: 360 + dy, fill: C.accent2 });
  write(file, svg(W, H, body, {
    title: 'Orbit Playground',
    desc: 'Generative interaction in p5.js. Dots in rose, violet and mint orbit four centres on a dark canvas.',
    style, defs: `<clipPath id="clip"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="23"/></clipPath>`,
  }));
}

// -------------------------------------------------------------- anatomy
function anatomy() {
  const W = 1280, H = 620;
  const cx = 360, cy = 320, r = 150;
  const a = -0.75; // angle shown
  const ox = cx + r * Math.cos(a), oy = cy + r * Math.sin(a);
  let b = frame(W, H);
  b += label('Anatomy of an orbiter', { x: 56, y: 64 });
  b += text('Two motions, added together', { font: F.display, size: 30, x: 56, y: 104, fill: C.ink });
  // drift box
  b += `<rect x="${cx - 70}" y="${cy - 70}" width="140" height="140" rx="10" stroke="${C.rule}" stroke-dasharray="4 6"/>`;
  b += `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${C.haze}" stroke-dasharray="2 6"/>`;
  b += `<circle cx="${cx}" cy="${cy}" r="5" fill="${C.ink}"/>`;
  b += arrow(cx, cy, cx + 54, cy + 30, { stroke: C.ice, width: 2 });
  b += label('drift', { x: cx + 18, y: cy + 58, fill: C.ice });
  // radius
  b += `<path d="M${cx} ${cy}L${r2(ox)} ${r2(oy)}" stroke="${C.ink2}" stroke-width="1.5"/>`;
  b += text('r', { font: F.mono, size: 15, x: cx + 62, y: cy - 66, fill: C.ink2 });
  // angle arc
  b += `<path d="M${cx + 46} ${cy}A46 46 0 0 0 ${r2(cx + 46 * Math.cos(a))} ${r2(cy + 46 * Math.sin(a))}" stroke="${C.accent2}" stroke-width="2"/>`;
  b += text('a', { font: F.mono, size: 15, x: cx + 54, y: cy - 12, fill: C.accent2 });
  // travel arc + dot
  const a2 = a - 0.7;
  b += `<path d="M${r2(ox)} ${r2(oy)}A${r} ${r} 0 0 0 ${r2(cx + r * Math.cos(a2))} ${r2(cy + r * Math.sin(a2))}" stroke="${ROSE}" stroke-width="7" stroke-linecap="round" opacity=".28"/>`;
  b += `<circle cx="${r2(ox)}" cy="${r2(oy)}" r="18" fill="${ROSE}" opacity=".2"/><circle cx="${r2(ox)}" cy="${r2(oy)}" r="8" fill="${ROSE}"/><circle cx="${r2(ox)}" cy="${r2(oy)}" r="3" fill="#fff" opacity=".6"/>`;
  b += arrow(cx + r * Math.cos(a2 + 0.08), cy + r * Math.sin(a2 + 0.08), cx + r * Math.cos(a2 - 0.02), cy + r * Math.sin(a2 - 0.02), { stroke: ROSE, width: 2, head: 9 });

  // the rules, on the right
  const rows = [
    ['Centre', 'Where you clicked. Drifts up to 0.25 px a frame and bounces off the edges of the canvas.', C.ice],
    ['Radius  r', 'Picked once, between 20 and 180 px.', C.ink2],
    ['Angle  a', 'Grows every frame by speed × s. Global speed runs from 0.002 to 0.080 (↑ ↓); s is the orbiter’s own factor, 0.5 to 1.5.', C.accent2],
    ['Size', 'Picked once, 4 to 12 px, drawn as a halo, a dot and a bright core.', ROSE],
    ['Position', 'x = centre.x + cos(a) · r      y = centre.y + sin(a) · r', C.ink],
  ];
  let y = 172;
  for (const [k, v, col] of rows) {
    b += `<circle cx="672" cy="${y - 5}" r="4" fill="${col}"/>`;
    b += text(k, { font: F.mono, size: 14, x: 690, y, fill: col });
    if (k === 'Position') {
      b += text(v.split('      ')[0], { font: F.mono, size: 14, x: 690, y: y + 28, fill: C.ink2 });
      b += text(v.split('      ')[1], { font: F.mono, size: 14, x: 690, y: y + 50, fill: C.ink2 });
      break;
    }
    const p = paragraph(v, { x: 690, y: y + 26, width: 520, size: 16, fill: C.ink2 });
    b += p.svg; y += 42 + p.height;
  }
  b += `<path d="M56 ${H - 70}H${W - 56}" stroke="${C.rule}"/>`;
  b += label('Every frame', { x: 56, y: H - 34 });
  const steps = ['wash the canvas at alpha 45', 'move every orbiter', 'draw every orbiter', 'add one more while held (every 6 frames)'];
  let sx = 200;
  steps.forEach((s, i) => {
    b += text(s, { font: F.body, size: 15, x: sx, y: H - 34, fill: C.ink2 });
    sx += F.body.getAdvanceWidth(s, 15) + 22;
    if (i < steps.length - 1) { b += arrow(sx - 16, H - 39, sx - 4, H - 39, { stroke: C.haze }); sx += 10; }
  });
  write('assets/anatomy.svg', svg(W, H, b, {
    title: 'Anatomy of an orbiter',
    desc: 'Each orbiter circles a centre that drifts slowly and bounces off the edges. Its radius is 20 to 180 pixels, its angle grows by the global speed times its own factor, and its size is 4 to 12 pixels. Every frame the canvas is washed at alpha 45, the orbiters move and are drawn, and one more is added every 6 frames while the mouse is held.',
  }));
}

// ------------------------------------------------------------- palettes
function palettes() {
  const W = 1280, H = 240;
  let b = frame(W, H);
  const list = [['1', 'Rose', ROSE, '220 70 135', 'alpha 240'], ['2', 'Violet', VIOLET, '170 140 255', 'alpha 150'], ['3', 'Mint', MINT, '120 255 190', 'alpha 150']];
  const cw = (W - 112 - 2 * 24) / 3;
  list.forEach(([k, name, col, rgb, al], i) => {
    const x = 56 + i * (cw + 24);
    b += `<rect x="${r2(x)}" y="48" width="${r2(cw)}" height="144" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
    seed = 3 + i * 7;
    for (let j = 0; j < 9; j++) {
      const dx = x + cw - 36 - rand(0, cw - 250), dy = rand(66, 150), s = rand(4, 12);
      b += `<circle cx="${r2(dx)}" cy="${r2(dy)}" r="${r2(s * 1.3)}" fill="${col}" opacity=".18"/><circle cx="${r2(dx)}" cy="${r2(dy)}" r="${r2(s / 2)}" fill="${col}"/>`;
    }
    b += key(k, x + 24, 72).svg;
    b += text(name, { font: F.display, size: 26, x: x + 24, y: 146, fill: C.ink });
    b += label(`rgb ${rgb} · ${al}`, { x: x + 24, y: 174, fill: C.muted, size: 11 });
  });
  write('assets/palettes.svg', svg(W, H, b, {
    title: 'The three palettes',
    desc: 'Key 1 is Rose, rgb 220 70 135. Key 2 is Violet, rgb 170 140 255. Key 3 is Mint, rgb 120 255 190.',
  }));
}

hero(); hero(640, 'design/social.svg'); anatomy(); palettes();
