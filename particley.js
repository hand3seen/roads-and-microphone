function Particle() {
  this.pos = createVector(random(width), random(height));
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.maxspeed = 2.5;
  this.prevPos = this.pos.copy();
  this.reactEnergy = 0; // set by sketch

  this.update = function () {
    // speed up slightly with audio energy
    var speedBoost = 1.0 + this.reactEnergy * 1.2;
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed * speedBoost);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  this.follow = function (vectors) {
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    x = constrain(x, 0, cols - 1);
    y = constrain(y, 0, rows - 1);
    var index = x + y * cols;
    var force = vectors[index];
    if (force) this.applyForce(force);
  }

  this.applyForce = function (force) {
    this.acc.add(force);
  }

  this.show = function () {
    // Audio‑reactive stroke weights (subtle)
    var thick = 120 + this.reactEnergy * 80; // 120..200
    var accent = 3 + this.reactEnergy * 6;   // 3..9

    stroke('#111111'); strokeWeight(thick); strokeCap(SQUARE);
    line(this.pos.x + 3, this.pos.y + 30, this.prevPos.x + 5, this.prevPos.y + 5);

    stroke('#ffc600'); strokeWeight(accent); strokeCap(SQUARE);
    point(this.pos.x + 7, this.pos.y - 3);

    stroke('#ffc600'); strokeWeight(accent); strokeCap(SQUARE);
    point(this.pos.x + 30, this.pos.y - 3);

    stroke('#222222'); strokeWeight(thick + 43); strokeCap(SQUARE);
    line(this.pos.x + 3, this.pos.y + 30, this.prevPos.x + 5, this.prevPos.y + 55);

    stroke('#000000'); strokeWeight(thick + 50); strokeCap(SQUARE);
    line(this.pos.x + 3, this.pos.y + 40, this.prevPos.x + 5, this.prevPos.y + 75);

    stroke('#333333'); strokeWeight(thick); strokeCap(SQUARE);
    line(this.pos.x + 3, this.pos.y + 30, this.prevPos.x + 5, this.prevPos.y + 85);

    // Small white accent line reacts too
    stroke(255); strokeWeight(1 + this.reactEnergy * 3);
    line(this.pos.x - 80, this.pos.y, this.prevPos.x + 60, this.prevPos.y);

    this.updatePrev();
  }

  this.updatePrev = function () {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }
  this.edges = function () {
    if (this.pos.x > width) { this.pos.x = 0; this.updatePrev(); }
    if (this.pos.x < 0) { this.pos.x = width; this.updatePrev(); }
    if (this.pos.y > height) { this.pos.y = 0; this.updatePrev(); }
    if (this.pos.y < 0) { this.pos.y = height; this.updatePrev(); }
  }
}
