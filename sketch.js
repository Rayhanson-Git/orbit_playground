// Orbit Playground
// An interactive canvas of orbiting dots. Every click sets a new centre of motion.
// © Harvey Rayhanson (Harvey Chowdhury), rayhanson.tech
//
// Controls
//   Click / tap          add an orbiter around that point
//   Hold / drag          keep adding, one every 6 frames
//   1 / 2 / 3            palette: Rose, Violet, Mint
//   Up / Down            orbital speed (0.002 to 0.080)
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

// Each palette keeps the colour of the original sketch as its base and adds
// a little variation, so a crowd of orbiters reads as one family.
const PALETTES = {
  1: { name: 'Rose', base: [220, 70, 135], alpha: 240, spread: 18 },
  2: { name: 'Violet', base: [170, 140, 255], alpha: 150, spread: 22 },
  3: { name: 'Mint', base: [120, 255, 190], alpha: 150, spread: 20 },
};

const BACKGROUND = [5, 6, 10];

// ------------------------------------------------------------------- state

let orbiters = [];
let palette = 1; // named so it never shadows p5's own colorMode()
let globalSpeed = SPEED_DEFAULT;
let paused = false;
let showGuide = true;
let reduceMotion = false;

// ------------------------------------------------------------------- p5 hooks

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.elt.setAttribute('role', 'img');
  canvas.elt.setAttribute(
    'aria-label',
    'Orbit Playground: coloured dots orbit points on a dark canvas. Click to add an orbiter.'
  );
  pixelDensity(min(2, displayDensity()));
  noStroke();

  // People who ask their system for less motion start at the slowest speed.
  reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  resetScene();
  background(...BACKGROUND);
}

function draw() {
  // A translucent wash each frame leaves the soft trails.
  background(...BACKGROUND, TRAIL_ALPHA);

  // (loop) update and draw every orbiter
  for (let i = 0; i < orbiters.length; i++) {
    if (!paused) orbiters[i].update();
    orbiters[i].display();
  }

  // the first centre of motion, in the middle of the canvas
  fill(220, 240, 255, 180);
  circle(width / 2, height / 2, 6);

  // holding the mouse keeps adding orbiters, slowly
  if (mouseIsPressed && !paused && frameCount % HOLD_INTERVAL === 0 && insideCanvas(mouseX, mouseY)) {
    addOrbiter(mouseX, mouseY);
  }

  drawGuide();
}

function mousePressed() {
  if (!insideCanvas(mouseX, mouseY)) return;
  addOrbiter(mouseX, mouseY);
  return false; // stop touch screens from scrolling or zooming
}

function keyPressed() {
  if (key === '1' || key === '2' || key === '3') palette = Number(key);

  if (key === 'c' || key === 'C') orbiters = [];
  if (key === 'r' || key === 'R') resetScene();
  if (key === 'h' || key === 'H') setGuideVisible(!showGuide);
  if (key === 's' || key === 'S') saveCanvas('orbit-playground', 'png');
  if (key === ' ') paused = !paused;

  if (keyCode === UP_ARROW) globalSpeed += SPEED_STEP;
  if (keyCode === DOWN_ARROW) globalSpeed -= SPEED_STEP;
  globalSpeed = constrain(globalSpeed, SPEED_MIN, SPEED_MAX);

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

// ------------------------------------------------------------------ helpers

function addOrbiter(x, y) {
  // keep it from getting too heavy
  if (orbiters.length < MAX_ORBITERS) orbiters.push(new Orbiter(x, y));
}

function resetScene() {
  orbiters = [];
  palette = 1;
  globalSpeed = reduceMotion ? SPEED_MIN : SPEED_DEFAULT;
  paused = false;
  for (let i = 0; i < START_COUNT; i++) orbiters.push(new Orbiter(width / 2, height / 2));
}

function insideCanvas(x, y) {
  return x >= 0 && y >= 0 && x <= width && y <= height;
}

// The guide lives in the page (index.html) rather than on the canvas, so it
// stays crisp, never smears into the trails, and screen readers can read it.
let statusEl;
function drawGuide() {
  statusEl = statusEl || document.getElementById('status');
  if (!statusEl || frameCount % 10 !== 0) return;
  statusEl.textContent =
    `${orbiters.length} / ${MAX_ORBITERS} orbiters · speed ${nf(globalSpeed, 1, 3)} · ${PALETTES[palette].name}` +
    (paused ? ' · paused' : '');
}

function setGuideVisible(visible) {
  showGuide = visible;
  const el = document.getElementById('guide');
  if (el) el.hidden = !visible;
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

  display() {
    const x = this.cx + cos(this.a) * this.r;
    const y = this.cy + sin(this.a) * this.r;
    const p = PALETTES[palette];
    const r = constrain(p.base[0] + this.tint[0] * p.spread, 0, 255);
    const g = constrain(p.base[1] + this.tint[1] * p.spread, 0, 255);
    const b = constrain(p.base[2] + this.tint[2] * p.spread, 0, 255);

    // soft halo, then the dot, then a bright core
    fill(r, g, b, p.alpha * 0.18);
    circle(x, y, this.size * 2.6);
    fill(r, g, b, p.alpha);
    circle(x, y, this.size);
    fill(255, 255, 255, 60);
    circle(x, y, this.size * 0.4);
  }
}
