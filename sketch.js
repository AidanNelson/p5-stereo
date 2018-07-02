/**
References:
http://paulbourke.net/stereographics/stereorender/
https://github.com/mrdoob/three.js/issues/5381
http://csc.lsu.edu/~kooima/articles/genperspective/index.html

*/

let rView, lView;
let leftEye, rightEye;

// how much extra room to render.
// I haven't made 'real' off-axis projection yet, but am rendering a larger-than-
// necessary scene, and 'punching in' to the desired portion
let buffer = 100;
let side;
var stereo;

function setup() {
  stereo = new controls();
  var gui = new dat.GUI();
  var interOcularDist = gui.add(stereo, "interocularDist", 0, 50, 1);
  gui.add(stereo, "offsetDist", 0, 100);
  var fullscreenButton = gui.add(stereo, "fullscreen");

  let w = 800;
  side = w / 2;
  let canvas = createCanvas(w, w / 2);
  setupStereo(0);
  // pixelDensity(1);
  let elt = canvas.elt;

  interOcularDist.onChange(function(val) {
    adjustStereo(val);
  });

  fullscreenButton.onFinishChange(function(val) {
    if (val) {
      fullSize(elt);
    }
  });
}

function draw() {
  background(200);

  // drawBoxes(rView);
  // drawBoxes(lView);

  drawSceneToBuffer(rView);
  drawSceneToBuffer(lView);

  drawViews();

  // center line
  strokeWeight(1);
  stroke(0);
  line(side, 0, side, side);
}

function drawSceneToBuffer(gb) {
  gb.background(250, 100, 250);
  gb.normalMaterial();
  gb.push();
  gb.translate(-10, 0, sin(PI + frameCount / 50) * 50);
  gb.box(10);

  gb.pop();

  gb.push();
  gb.translate(10, 0, sin(frameCount / 50) * 50);
  gb.box(10);
  gb.pop();
}

function drawViews() {
  // trying to create hacky off-axis stereo pairs as described here:
  // http://paulbourke.net/stereographics/stereorender/
  let eb = buffer / 2; //edge buffer
  let vOffset = 0;

  let offset = stereo.offsetDist;
  let leftOffset = +offset / 2;
  let rightOffset = -offset / 2;
  image(
    lView,
    0,
    0,
    side,
    side,
    0 + leftOffset + eb,
    0 + vOffset + eb,
    side,
    side
  );
  image(
    rView,
    side,
    0,
    side,
    side,
    0 + rightOffset + eb,
    0 + vOffset + eb,
    side,
    side
  );
}

function setupStereo() {
  lView = createGraphics(height + buffer, height + buffer, WEBGL);
  leftEye = lView.createCamera();
  leftEye.camera(0, 0, 100, 0, 0, 0, 0, 1, 0);
  leftEye.perspective(PI / 3.0, 1, 1, 1000);
  lView._renderer.setCamera(leftEye);

  rView = createGraphics(height + buffer, height + buffer, WEBGL);
  rightEye = rView.createCamera();
  rightEye.camera(0, 0, 100, 0, 0, 0, 0, 1, 0);
  rightEye.perspective(PI / 3.0, 1, 1, 1000);
  rView._renderer.setCamera(rightEye);
}

function adjustStereo(eyeDist) {
  leftEye.camera(-eyeDist / 2, 0, 100, -eyeDist / 2, 0, 0, 0, 1, 0);
  leftEye.perspective(PI / 3.0, 1, 1, 1000);
  rightEye.camera(eyeDist / 2, 0, 100, eyeDist / 2, 0, 0, 0, 1, 0);
  rightEye.perspective(PI / 3.0, 1, 1, 1000);
}

var controls = function() {
  this.interocularDist = 5;
  this.offsetDist = 20;
  this.fullscreen = false;
};

function fullSize(container) {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}
