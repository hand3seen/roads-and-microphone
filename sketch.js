// --- Modified to be mic‑reactive ---
// Globals from original
var inc = 0.1;
var scl = 100;
var cols, rows;
var zoff = 0;
var fr;
var particles = [];
var flowfield;

function setup() {
  // Fit to window and be DPI aware
  createCanvas(window.innerWidth, window.innerHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);
  fr = createP(''); fr.hide(); // hide fps text

  flowfield = new Array(cols * rows);

  for (var i = 0; i < 5; i++) {
    particles[i] = new Particle();
    background('black');
  }
}

function windowResized(){
  resizeCanvas(window.innerWidth, window.innerHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);
  background('black');
}

function draw() {
  // Use mic level to influence the field + particles
  var lvl = (typeof getAudioLevel === 'function') ? getAudioLevel() : 0.0; // 0..~0.5
  var energy = constrain(map(lvl, 0.0, 0.35, 0.0, 1.0), 0, 1); // normalized 0..1

  // Modulate noise scroll + vector magnitude with energy
  var mag = 0.35 + energy * 1.2;         // base .35 → up to ~1.55
  var incBoost = 0.1 + energy * 0.25;    // base 0.1 → up to 0.35
  var zBoost = 0.00025 + energy * 0.001; // base scroll speed -> faster when louder

  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = (x + y * cols);
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 3;
      var v = p5.Vector.fromAngle(angle);
      flowfield[index] = v;
      v.setMag(mag);
      xoff += incBoost;
    }
    yoff += incBoost;
    zoff += zBoost;
  }

  for (var i = 0; i < particles.length; i++) {
    particles[i].reactEnergy = energy; // pass to particle for stroke modulation
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }

  // Optionally show FPS for debugging
  // fr.html(nf(frameRate(),2,0));
}
