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
    label('Click · Hold · 1–4 · ↑ ↓ · O · L · K', { x: 64, y: 360 + dy, fill: C.accent2 });
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
  const AUR = ['rgb(255,120,150)', 'rgb(255,200,90)', 'rgb(120,255,160)', 'rgb(90,200,255)', 'rgb(170,120,255)'];
  const list = [['1', 'Rose', ROSE, 'rgb 220 70 135'], ['2', 'Violet', VIOLET, 'rgb 170 140 255'], ['3', 'Mint', MINT, 'rgb 120 255 190'], ['4', 'Aurora', null, 'hue follows each orbit']];
  const gap = 20, cw = (W - 112 - 3 * gap) / 4;
  list.forEach(([k, name, col, sub], i) => {
    const x = 56 + i * (cw + gap);
    b += `<rect x="${r2(x)}" y="48" width="${r2(cw)}" height="144" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
    seed = 3 + i * 7;
    for (let j = 0; j < 8; j++) {
      const c = col || AUR[j % AUR.length];
      const dx = x + cw - 26 - rand(0, cw - 150), dy = rand(66, 120), s = rand(4, 11);
      b += `<circle cx="${r2(dx)}" cy="${r2(dy)}" r="${r2(s * 1.3)}" fill="${c}" opacity=".18"/><circle cx="${r2(dx)}" cy="${r2(dy)}" r="${r2(s / 2)}" fill="${c}"/>`;
    }
    b += key(k, x + 22, 66).svg;
    b += text(name, { font: F.display, size: 24, x: x + 22, y: 150, fill: C.ink });
    b += label(sub, { x: x + 22, y: 176, fill: C.muted, size: 10.5 });
  });
  write('assets/palettes.svg', svg(W, H, b, {
    title: 'The four palettes',
    desc: 'Key 1 is Rose, rgb 220 70 135. Key 2 is Violet, rgb 170 140 255. Key 3 is Mint, rgb 120 255 190. Key 4 is Aurora, where each orbiter moves through the hues as it travels.',
  }));
}

// The four orbit shapes, drawn from the same formulas as sketch.js, plus
// links and the kaleidoscope.
function shapes() {
  const W = 1280, H = 640;
  let b = frame(W, H);
  b += label('Press O · four orbit shapes', { x: 56, y: 64 }) + text('Same orbiters, different paths', { font: F.display, size: 30, x: 56, y: 104, fill: C.ink });
  const cards = [
    ['Circle', 'the original: a fixed radius', (a) => [Math.cos(a), Math.sin(a)], ROSE],
    ['Ellipse', 'a tilted, squashed circle', (a) => { const ex = Math.cos(a), ey = Math.sin(a) * 0.45, t = -0.5; return [ex * Math.cos(t) - ey * Math.sin(t), ex * Math.sin(t) + ey * Math.cos(t)]; }, VIOLET],
    ['Flower', 'r · cos(petals · a), 2–5 petals', (a) => { const rr = Math.cos(3 * a); return [Math.cos(a) * rr, Math.sin(a) * rr]; }, MINT],
    ['Spiral', 'r breathes from 10% to 100%', (a) => { const rr = 0.55 + 0.45 * Math.sin(a * 0.37); return [Math.cos(a) * rr, Math.sin(a) * rr]; }, 'rgb(255,200,90)'],
  ];
  const gap = 20, cw = (W - 112 - 3 * gap) / 4;
  cards.forEach(([name, sub, f, col], i) => {
    const x = 56 + i * (cw + gap), y = 136, ch = 290;
    b += `<rect x="${r2(x)}" y="${y}" width="${r2(cw)}" height="${ch}" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
    const cx = x + cw / 2, cy = y + 130, R = 92;
    const turns = name === 'Spiral' ? 6 * Math.PI * 2 : Math.PI * 2;
    let d = '';
    for (let j = 0; j <= 600; j++) { const [px, py] = f((j / 600) * turns); d += `${j ? 'L' : 'M'}${r2(cx + px * R)} ${r2(cy + py * R)}`; }
    b += `<path d="${d}" stroke="${col}" stroke-width="1.6" opacity=".55"/>`;
    b += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="3.5" fill="${C.ink}"/>`;
    const [px, py] = f(name === 'Spiral' ? 2.2 : 0.7);
    b += `<circle cx="${r2(cx + px * R)}" cy="${r2(cy + py * R)}" r="13" fill="${col}" opacity=".22"/><circle cx="${r2(cx + px * R)}" cy="${r2(cy + py * R)}" r="5.5" fill="${col}"/>`;
    b += text(name, { font: F.display, size: 22, x: x + 22, y: y + ch - 44, fill: C.ink });
    b += text(sub, { font: F.mono, size: 11.5, x: x + 22, y: y + ch - 20, fill: C.muted });
  });
  // links and kaleidoscope
  const y2 = 450, half = (W - 112 - gap) / 2;
  b += `<rect x="56" y="${y2}" width="${r2(half)}" height="150" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
  seed = 40;
  const pts = Array.from({ length: 16 }, () => [rand(360, 56 + half - 30), rand(y2 + 22, y2 + 128)]);
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < 90) b += `<path d="M${r2(pts[i][0])} ${r2(pts[i][1])}L${r2(pts[j][0])} ${r2(pts[j][1])}" stroke="${MINT}" stroke-width="1" opacity="${r2(0.15 + 0.5 * (1 - d / 90))}"/>`;
  }
  for (const [px, py] of pts) b += `<circle cx="${r2(px)}" cy="${r2(py)}" r="7" fill="${MINT}" opacity=".2"/><circle cx="${r2(px)}" cy="${r2(py)}" r="3" fill="${MINT}"/>`;
  b += key('L', 78, y2 + 24).svg + text('Constellation links', { font: F.display, size: 22, x: 78, y: y2 + 90, fill: C.ink });
  b += paragraph('Orbiters closer than 90 px are joined; the closer, the brighter.', { x: 78, y: y2 + 116, width: 250, size: 13.5 }).svg;
  const kx = 56 + half + gap;
  b += `<rect x="${r2(kx)}" y="${y2}" width="${r2(half)}" height="150" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
  const mcx = kx + half - 120, mcy = y2 + 75;
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI * 2 * k) / 6;
    b += `<g transform="rotate(${r2((a * 180) / Math.PI)} ${r2(mcx)} ${mcy})"><ellipse cx="${r2(mcx + 34)}" cy="${mcy}" rx="30" ry="12" stroke="${VIOLET}" stroke-width="1.4" opacity=".55" transform="rotate(-25 ${r2(mcx + 34)} ${mcy})"/><circle cx="${r2(mcx + 58)}" cy="${mcy - 10}" r="4.5" fill="${VIOLET}"/><circle cx="${r2(mcx + 22)}" cy="${mcy + 8}" r="3" fill="${VIOLET}" opacity=".8"/></g>`;
  }
  b += `<circle cx="${r2(mcx)}" cy="${mcy}" r="3" fill="${C.ink}"/>`;
  b += key('K', kx + 22, y2 + 24).svg + text('Kaleidoscope', { font: F.display, size: 22, x: kx + 22, y: y2 + 90, fill: C.ink });
  b += paragraph('The scene drawn 1, 2, 3, 4 or 6 times, turned around the centre.', { x: kx + 22, y: y2 + 116, width: 300, size: 13.5 }).svg;
  write('assets/shapes.svg', svg(W, H, b, {
    title: 'Orbit shapes, links and kaleidoscope',
    desc: 'Press O to cycle four orbit shapes: Circle, Ellipse (a tilted, squashed circle), Flower (a rose curve with 2 to 5 petals) and Spiral (a radius that breathes in and out). Press L for constellation links between orbiters closer than 90 pixels, and K for a kaleidoscope that draws the scene 1, 2, 3, 4 or 6 times around the centre.',
  }));
}

hero(); hero(640, 'design/social.svg'); anatomy(); palettes(); shapes();
