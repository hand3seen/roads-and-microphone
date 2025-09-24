// Mic-reactive multiband flowfield
var inc = 0.1;
var scl = 100;
var cols, rows;
var zoff = 0;
var particles = [];
var flowfield;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);
  for (var i = 0; i < 5; i++) {
    particles[i] = new Particle();
  }
  background(0);
}

function windowResized(){
  resizeCanvas(window.innerWidth, window.innerHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);
  background(0);
}

function draw() {
  // Multiband levels
  var lvl = (typeof getAudioLevel === 'function') ? getAudioLevel() : 0.0; // overall 0..~0.5
  var bands = (typeof getBandLevels === 'function') ? getBandLevels() : {bass:0,mids:0,highs:0};

  // Normalize/shape bands -> 0..1
  var bass = constrain(map(bands.bass, 0.00, 0.20, 0.0, 1.0), 0, 1);
  var mids = constrain(map(bands.mids, 0.00, 0.25, 0.0, 1.0), 0, 1);
  var highs= constrain(map(bands.highs,0.00, 0.20, 0.0, 1.0), 0, 1);

  // Map bands to behaviors:
  // bass -> vector magnitude (push)
  // mids -> field detail/speed (incBoost) + z scroll
  // highs -> particle accents/sparks
  var mag = 0.35 + bass * 1;
  var incBoost = 0.08 + mids * 2;
  var zBoost = 0.0002 + mids * 0.1;
  var highlight = highs; // forwarded to particles

  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 3;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(mag);
      flowfield[index] = v;
      xoff += incBoost;
    }
    yoff += incBoost;
    zoff += zBoost;
  }

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    p.reactEnergy = constrain(map(lvl, 0.0, 0.35, 0.0, 1.0), 0, 1);
    p.reactBands = { bass: bass, mids: mids, highs: highlight };
    p.follow(flowfield);
    p.update();
    p.edges();
    p.show();
  }
}
