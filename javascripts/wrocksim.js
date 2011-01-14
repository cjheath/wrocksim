Rocket = function(div, flight) {
  console.log("Rocket div is "+div);
  var r = Raphael(div, '100%', '100%');

  // Generic drawing parameters
  var centreX = 250;
  var noseStart = 20;

  // Current rocket parameters (draggable):
  var noseLength = 120;			// How long is the nose?
  var radius = 110;			// Bottle radius
  var bodyLength = 400;			// Bottle body length
  var bore = 22;			// Launch-tube radius
  var orifice = 8;			// Nozzle radius, may be less than bore
  var neckReduction = radius*5/4;	// Length of the reduction part of the neck
  var neckLength = radius*6/4;		// Total length of the neck
  var neckRoundness = 0.8;		// 0 = conical, 1 = fully rounded
  var neckSplit = 0.8;			// How much of the curvature is near max diameter vs neck
  var launchTubeLength = 600;		// How long is the launch tube?

  // Current rocket parts, removed on making new ones
  var nose = null;
  var body = null;
  var nozzle = null;
  var launchTube = null;

  var makeNose = function() {
    if (nose) nose.remove();
    var _nose = r.path([
	'M', centreX-radius, noseStart+noseLength,
	'c', 0, -noseLength/2, radius/2, -noseLength, radius, -noseLength,
	'c', radius/2, 0, radius, noseLength/2, radius, noseLength,
	'c', 0, -radius/8, -radius*2, -radius/8, -radius*2, 0
      ]);
    _nose.attr({fill: "#EEE", "fill-opacity": 0.6});
    return _nose;
  };

  var makeBody = function() {
    if (body) body.remove();
    var _body = r.path([
      'M', centreX-radius, noseStart+noseLength,
      'c', 0, -radius/8, radius*2, -radius/8, radius*2, 0,
      'l', 0, bodyLength,
      'c', 0, radius/8, -radius*2, radius/8, -radius*2, 0,
      'l', 0, -bodyLength,
    ]);
    _body.attr({fill: "#EEE", "fill-opacity": 0.6});
    return _body;
  };

  var makeNozzle = function() {
    if (nozzle) nozzle.remove();
    var top = noseStart+noseLength+bodyLength;
    var topSmoothing = neckReduction*neckSplit*neckRoundness;
    var neckSmoothing = neckReduction*(1-neckSplit)*neckRoundness;

    var _nozzle = r.path([
	'M', centreX-radius, top,
	'c', 0, topSmoothing,
	     radius-bore, neckReduction-neckSmoothing,
	     radius-bore, neckReduction,
	'l', 0, neckLength-neckReduction,
	'l', bore*2, 0,
	'l', 0, -neckLength+neckReduction,
	'c', 0, -neckSmoothing,
	     radius-bore, -neckReduction+topSmoothing,
	     radius-bore, -neckReduction,
	'c', 0, radius/8, -radius*2, radius/8, -radius*2, 0
      ]);
    _nozzle.attr({fill: "#EEE", "fill-opacity": 0.6});
    return _nozzle;
  };

  var makeLaunchTube = function() {
    if (launchTube) launchTube.remove();
    if (launchTubeLength == 0) return;
    var bottom = noseStart+noseLength+bodyLength+neckLength;
    var _tube = r.path([
	'M', centreX-bore+2, bottom+40,
	'l', 0, -(launchTubeLength+40),
	'c', 0, -bore/4, (bore-2)*2, -bore/4, (bore-2)*2, 0,
	'l', 0, launchTubeLength+40,
	'c', 0, bore/4, -(bore-2)*2, bore/4, -(bore-2)*2, 0
      ]);
    _tube.attr({fill: "#00F", "fill-opacity": 0.8});
    return _tube;
  }

  var nose = makeNose();
  var body = makeBody();
  var nozzle = makeNozzle();
  var launchTube = makeLaunchTube();
};

Flight = function(div) {
  console.log("Flight div is "+div);
  var paper = Raphael(div, '100%', '100%');
};
