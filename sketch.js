// Orbit Playground
// An interactive canvas of orbiting dots. Every click sets a new centre of motion.
// © Harvey Rayhanson (Harvey Chowdhury), rayhanson.tech
//
// Controls (keyboard, or the dock at the bottom of the screen)
//   Click / tap          add an orbiter around that point
//   Hold / drag          keep adding, one every 6 frames
//   1 / 2 / 3 / 4        palette: Rose, Violet, Mint, Aurora
//   Up / Down            orbital speed (0.002 to 0.080)
//   O                    orbit shape: Circle, Ellipse, Flower, Spiral
//   L                    constellation links between nearby orbiters
//   K                    kaleidoscope: 1, 2, 3, 4 or 6 copies around the centre
//   Space                pause or resume
//   C                    clear every orbiter
//   R                    restore the starting scene
//   H                    hide or show the guide
//   S                    save the canvas as a PNG
//
// Course concepts it was built around (MTEC 1201): loops, arrays and classes.

// ---------------------------------------------------------------- settings

const START_COUNT = 20; // orbiters in the starting scene
const MAX_ORBITERS = 300; // keeps the frame rate steady
const HOLD_INTERVAL = 6; // frames between orbiters while the mouse is held
const SPEED_DEFAULT = 0.02;
const SPEED_STEP = 0.005;
const SPEED_MIN = 0.002;
const SPEED_MAX = 0.08;
const TRAIL_ALPHA = 45; // lower = longer trails
const LINK_DISTANCE = 90; // px: orbiters closer than this are linked
const MAX_LINKS = 1500; // per frame, so a tight crowd cannot stall the sketch
const SYMMETRIES = [1, 2, 3, 4, 6];
const SHAPES = ['Circle', 'Ellipse', 'Flower', 'Spiral'];

// Palettes 1 to 3 keep the colours of the original sketch as their base and
// add a little variation, so a crowd of orbiters reads as one family.
// Aurora (4) moves every orbiter through the hues as it travels.
const PALETTES = {
  1: { name: 'Rose', base: [220, 70, 135], alpha: 240, spread: 18 },
  2: { name: 'Violet', base: [170, 140, 255], alpha: 150, spread: 22 },
  3: { name: 'Mint', base: [120, 255, 190], alpha: 150, spread: 20 },
  4: { name: 'Aurora', base: null, alpha: 200, spread: 0 },
};

const BACKGROUND = [5, 6, 10];
const STORAGE_KEY = 'orbit-playground:settings';

// ------------------------------------------------------------------- state

let orbiters = [];
let palette = 1; // named so it never shadows p5's own colorMode()
let globalSpeed = SPEED_DEFAULT;
let shape = 0; // index into SHAPES
let links = false;
let symmetry = 1;
let paused = false;
let showGuide = true;
let reduceMotion = false;
let canvasEl;
let pressOnCanvas = false; // true while a press that began on the canvas is held

// ------------------------------------------------------------------- p5 hooks

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvasEl = canvas.elt;
  canvasEl.setAttribute('role', 'img');
  canvasEl.setAttribute(
    'aria-label',
    'Orbit Playground: coloured dots orbit points on a dark canvas. Click to add an orbiter.'
  );
  pixelDensity(min(2, displayDensity()));
  noStroke();

  reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  resetScene(false); // the starting scene, without overwriting what was remembered
  loadSettings();
  wireDock();
  syncDock();
  background(...BACKGROUND);
}

function draw() {
  // A translucent wash each frame leaves the soft trails.
  background(...BACKGROUND, TRAIL_ALPHA);

  // (loop) move every orbiter, then work out where each one is
  const points = new Array(orbiters.length);
  for (let i = 0; i < orbiters.length; i++) {
    if (!paused) orbiters[i].update();
    points[i] = orbiters[i].position();
  }

  // draw the whole picture once per kaleidoscope copy, turned around the centre
  for (let k = 0; k < symmetry; k++) {
    push();
    if (k > 0) {
      translate(width / 2, height / 2);
      rotate((TWO_PI * k) / symmetry);
      translate(-width / 2, -height / 2);
    }
    if (links) drawLinks(points);
    for (let i = 0; i < orbiters.length; i++) orbiters[i].display(points[i]);
    pop();
  }

  // the first centre of motion, in the middle of the canvas
  fill(220, 240, 255, 180);
  circle(width / 2, height / 2, 6);

  // holding the mouse keeps adding orbiters, slowly
  if (pressOnCanvas && mouseIsPressed && !paused && frameCount % HOLD_INTERVAL === 0 && insideCanvas(mouseX, mouseY)) {
    addOrbiter(mouseX, mouseY);
  }

  updateGuide();
}

function mousePressed(event) {
  // presses on the dock or the guide are not drawing
  if (event && event.target !== canvasEl) return;
  if (!insideCanvas(mouseX, mouseY)) return;
  pressOnCanvas = true;
  addOrbiter(mouseX, mouseY);
  return false; // stop touch screens from scrolling or zooming
}

function mouseReleased() {
  pressOnCanvas = false;
}

// Touch screens: p5 does not call mousePressed when a finger lands, so the
// touch handlers share the mouse code. Returning false from a press on the
// canvas also stops the browser from sending a second, emulated click.
function touchStarted(event) {
  return mousePressed(event);
}

function touchEnded() {
  pressOnCanvas = false;
}

function keyPressed() {
  if (key >= '1' && key <= '4') setPalette(Number(key));
  else if (key === 'c' || key === 'C') orbiters = [];
  else if (key === 'r' || key === 'R') resetScene();
  else if (key === 'h' || key === 'H') setGuideVisible(!showGuide);
  else if (key === 's' || key === 'S') saveCanvas('orbit-playground', 'png');
  else if (key === 'o' || key === 'O') cycleShape();
  else if (key === 'l' || key === 'L') toggleLinks();
  else if (key === 'k' || key === 'K') cycleSymmetry();
  else if (key === ' ') togglePause();
  else if (keyCode === UP_ARROW) changeSpeed(1);
  else if (keyCode === DOWN_ARROW) changeSpeed(-1);

  syncDock();
  // keep Space and the arrow keys from scrolling the page
  if (key === ' ' || keyCode === UP_ARROW || keyCode === DOWN_ARROW) return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(...BACKGROUND);
  // pull every centre back inside the new canvas
  for (const o of orbiters) {
    o.cx = constrain(o.cx, 0, width);
    o.cy = constrain(o.cy, 0, height);
  }
}

// ------------------------------------------------------------------ actions

function addOrbiter(x, y) {
  // keep it from getting too heavy
  if (orbiters.length < MAX_ORBITERS) orbiters.push(new Orbiter(x, y));
}

function resetScene(remember = true) {
  orbiters = [];
  palette = 1;
  globalSpeed = reduceMotion ? SPEED_MIN : SPEED_DEFAULT;
  shape = 0;
  links = false;
  symmetry = 1;
  paused = false;
  for (let i = 0; i < START_COUNT; i++) orbiters.push(new Orbiter(width / 2, height / 2));
  background(...BACKGROUND);
  if (remember) saveSettings();
}

function setPalette(n) {
  palette = n;
  saveSettings();
}

function changeSpeed(direction) {
  globalSpeed = constrain(globalSpeed + direction * SPEED_STEP, SPEED_MIN, SPEED_MAX);
  // rounding keeps repeated steps from drifting (0.02 + 0.005 is not exact in floating point)
  globalSpeed = Math.round(globalSpeed * 1000) / 1000;
  saveSettings();
}

function cycleShape() {
  shape = (shape + 1) % SHAPES.length;
  saveSettings();
}

function toggleLinks() {
  links = !links;
  saveSettings();
}

function cycleSymmetry() {
  symmetry = SYMMETRIES[(SYMMETRIES.indexOf(symmetry) + 1) % SYMMETRIES.length];
  background(...BACKGROUND);
  saveSettings();
}

function togglePause() {
  paused = !paused;
}

// ------------------------------------------------------------- remembering

// Palette, speed, shape, links and kaleidoscope are kept between visits.
// Storage can be unavailable (private windows, blocked cookies): then the
// sketch simply starts from the defaults.
function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ palette, globalSpeed, shape, links, symmetry }));
  } catch (e) {
    /* storage unavailable */
  }
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!s) return;
    if (PALETTES[s.palette]) palette = s.palette;
    if (typeof s.globalSpeed === 'number') globalSpeed = constrain(s.globalSpeed, SPEED_MIN, SPEED_MAX);
    if (SHAPES[s.shape]) shape = s.shape;
    links = s.links === true;
    if (SYMMETRIES.includes(s.symmetry)) symmetry = s.symmetry;
  } catch (e) {
    /* storage unavailable or unreadable */
  }
}

// ------------------------------------------------------------------ drawing

function drawLinks(points) {
  // Constellation lines between orbiters that pass close to each other.
  // Lines are sorted into four opacity bands and each band is stroked as one
  // canvas path, which is far cheaper than one p5 line() call per pair.
  const maxSq = LINK_DISTANCE * LINK_DISTANCE;
  const [r, g, b] = PALETTES[palette].base || [190, 220, 255];
  const bands = [[], [], [], []];
  let count = 0;
  for (let i = 0; i < points.length && count < MAX_LINKS; i++) {
    const a = points[i];
    for (let j = i + 1; j < points.length; j++) {
      const p = points[j];
      const dx = a.x - p.x;
      const dy = a.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < maxSq) {
        const closeness = 1 - Math.sqrt(d2) / LINK_DISTANCE; // 1 = touching
        bands[Math.min(3, Math.floor(closeness * 4))].push(a.x, a.y, p.x, p.y);
        if (++count >= MAX_LINKS) break;
      }
    }
  }
  const ctx = drawingContext;
  ctx.lineWidth = 1;
  for (let k = 0; k < 4; k++) {
    const coords = bands[k];
    if (!coords.length) continue;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${((k + 0.5) / 4) * 0.28})`;
    ctx.beginPath();
    for (let c = 0; c < coords.length; c += 4) {
      ctx.moveTo(coords[c], coords[c + 1]);
      ctx.lineTo(coords[c + 2], coords[c + 3]);
    }
    ctx.stroke();
  }
}

// Hue (0 to 360) to RGB, for the Aurora palette.
function hueToRgb(h, s = 0.65, v = 1) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return 255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1)));
  };
  return [f(5), f(3), f(1)];
}

// ------------------------------------------------------------------- the dock

// Buttons at the bottom of the screen mirror the keyboard, so every control
// works on phones and tablets too.
function wireDock() {
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        fn();
        syncDock();
      });
    }
  };
  on('dock-palette', () => setPalette((palette % 4) + 1));
  on('dock-shape', cycleShape);
  on('dock-links', toggleLinks);
  on('dock-symmetry', cycleSymmetry);
  on('dock-slower', () => changeSpeed(-1));
  on('dock-faster', () => changeSpeed(1));
  on('dock-pause', togglePause);
  on('dock-clear', () => {
    orbiters = [];
  });
  on('dock-reset', () => resetScene());
  on('dock-save', () => saveCanvas('orbit-playground', 'png'));
  on('dock-guide', () => setGuideVisible(!showGuide));
}

function syncDock() {
  const set = (id, text, pressed) => {
    const el = document.getElementById(id);
    if (!el) return;
    const span = el.querySelector('span');
    if (text != null && span && span.textContent !== text) span.textContent = text;
    if (pressed != null) el.setAttribute('aria-pressed', String(pressed));
  };
  set('dock-palette', PALETTES[palette].name);
  set('dock-shape', SHAPES[shape]);
  set('dock-links', links ? 'Links on' : 'Links', links);
  set('dock-symmetry', symmetry === 1 ? 'Mirror' : `× ${symmetry}`, symmetry > 1);
  set('dock-pause', paused ? 'Play' : 'Pause', paused);
  set('dock-guide', null, showGuide);
}

// The guide lives in the page (index.html) rather than on the canvas, so it
// stays crisp, never smears into the trails, and screen readers can read it.
let statusEl;
function updateGuide() {
  statusEl = statusEl || document.getElementById('status');
  if (!statusEl || frameCount % 10 !== 0) return;
  statusEl.textContent =
    `${orbiters.length} / ${MAX_ORBITERS} orbiters · speed ${nf(globalSpeed, 1, 3)} · ${PALETTES[palette].name} · ${SHAPES[shape]}` +
    (links ? ' · links' : '') +
    (symmetry > 1 ? ` · kaleidoscope × ${symmetry}` : '') +
    (paused ? ' · paused' : '');
}

function setGuideVisible(visible) {
  showGuide = visible;
  const el = document.getElementById('guide');
  if (el) el.hidden = !visible;
}

function insideCanvas(x, y) {
  return x >= 0 && y >= 0 && x <= width && y <= height;
}

// ------------------------------------------------------------------- classes

class Orbiter {
  constructor(startX, startY) {
    // each orbiter circles its own centre, set where it was added
    this.cx = startX;
    this.cy = startY;

    // orbit radius and starting angle
    this.r = random(20, 180);
    this.a = random(TWO_PI);

    // its own speed, multiplied by the global speed
    this.s = random(0.5, 1.5);

    this.size = random(4, 12);

    // the centre drifts gently, and bounces off the edges
    this.dx = random(-0.25, 0.25);
    this.dy = random(-0.25, 0.25);

    // a fixed offset inside the palette, so colours stay put when it changes
    this.tint = [random(-1, 1), random(-1, 1), random(-1, 1)];

    // what each orbit shape needs, picked once
    this.tilt = random(TWO_PI); // Ellipse: the direction of the long axis
    this.squash = random(0.3, 0.75); // Ellipse: short axis as a share of the long one
    this.petals = floor(random(2, 6)); // Flower: 2 to 5 petals
    this.phase = random(TWO_PI); // Spiral: where in its breath it starts
    this.hue = random(360); // Aurora: starting hue
  }

  update() {
    this.a += globalSpeed * this.s;

    this.cx += this.dx;
    this.cy += this.dy;
    if (this.cx < 0 || this.cx > width) this.dx *= -1;
    if (this.cy < 0 || this.cy > height) this.dy *= -1;
    this.cx = constrain(this.cx, 0, width);
    this.cy = constrain(this.cy, 0, height);
  }

  // Where the dot is now, for the current orbit shape.
  position() {
    const a = this.a;
    let ox;
    let oy;
    switch (SHAPES[shape]) {
      case 'Ellipse': {
        const ex = cos(a) * this.r;
        const ey = sin(a) * this.r * this.squash;
        ox = ex * cos(this.tilt) - ey * sin(this.tilt);
        oy = ex * sin(this.tilt) + ey * cos(this.tilt);
        break;
      }
      case 'Flower': {
        // a rose curve: the radius swells and shrinks once per petal
        const rr = this.r * cos(this.petals * a);
        ox = cos(a) * rr;
        oy = sin(a) * rr;
        break;
      }
      case 'Spiral': {
        // the radius breathes in and out, so the path winds in towards the centre and back
        const rr = this.r * (0.55 + 0.45 * sin(a * 0.37 + this.phase));
        ox = cos(a) * rr;
        oy = sin(a) * rr;
        break;
      }
      default:
        ox = cos(a) * this.r;
        oy = sin(a) * this.r;
    }
    return { x: this.cx + ox, y: this.cy + oy };
  }

  display(p) {
    const pal = PALETTES[palette];
    let r;
    let g;
    let b;
    if (pal.base) {
      r = constrain(pal.base[0] + this.tint[0] * pal.spread, 0, 255);
      g = constrain(pal.base[1] + this.tint[1] * pal.spread, 0, 255);
      b = constrain(pal.base[2] + this.tint[2] * pal.spread, 0, 255);
    } else {
      [r, g, b] = hueToRgb((this.hue + degrees(this.a) * 0.5) % 360);
    }

    // soft halo, then the dot, then a bright core
    fill(r, g, b, pal.alpha * 0.18);
    circle(p.x, p.y, this.size * 2.6);
    fill(r, g, b, pal.alpha);
    circle(p.x, p.y, this.size);
    fill(255, 255, 255, 60);
    circle(p.x, p.y, this.size * 0.4);
  }
}
