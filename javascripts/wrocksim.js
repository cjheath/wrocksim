Rocket = function(div, flight) {
  var r = Raphael(div, '100%', '100%');

  // Generic drawing parameters
  var centreX = 250;
  var noseStart = 20;
  var hW = 5;				// Handle Width

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
  var launchTubeLength = 500;		// How long is the launch tube?
  var waterLevel = 100;

  // Current rocket parts, removed on making new ones
  var nose = null;
  var body = null;
  var nozzle = null;
  var launchTube = null;
  var water = null;
  var bodyHandle = null;
  var noseHandle = null;
  var reductionHandle = null;

  var makeNose = function() {
    if (!nose) nose = r.path();
    nose.attr({path: [
	'M', centreX-radius, noseStart+noseLength,
	'c', 0, -noseLength/2, radius/2, -noseLength, radius, -noseLength,
	'c', radius/2, 0, radius, noseLength/2, radius, noseLength,
	'c', 0, -radius/8, -radius*2, -radius/8, -radius*2, 0
      ]});
    nose.attr({fill: "#E8E8E8", stroke: "#AAA", "stroke-width": 2});
  };

  var makeBody = function() {
    if (!body) body = r.path();
    body.attr({path: [
      'M', centreX-radius, noseStart+noseLength,
      'c', 0, -radius/8, radius*2, -radius/8, radius*2, 0,
      'l', 0, bodyLength,
      'c', 0, radius/8, -radius*2, radius/8, -radius*2, 0,
      'l', 0, -bodyLength,
    ]});
    body.attr({fill: "#E8E8E8", stroke: "#AAA", "stroke-width": 2});
  };

  var nozzlePath = function() {
    var top = noseStart+noseLength+bodyLength;
    var topSmoothing = neckReduction*neckSplit*neckRoundness;
    var neckSmoothing = neckReduction*(1-neckSplit)*neckRoundness;
    return [
	'M', centreX-radius, top,
	'c', 0, topSmoothing,
	     radius-bore, neckReduction-neckSmoothing,
	     radius-bore, neckReduction,
	'l', 0, neckLength-neckReduction,
	'l', bore*2, 0,
	'l', 0, -neckLength+neckReduction,
	'c', 0, -neckSmoothing,
	     radius-bore, -neckReduction+topSmoothing,
	     radius-bore, -neckReduction
      ];
  };

  var makeNozzle = function() {
    if (!nozzle) nozzle = r.path();

    nozzle.attr({path: nozzlePath() + ['c', 0, radius/8, -radius*2, radius/8, -radius*2, 0]});
    nozzle.attr({fill: "#E8E8E8", stroke: "#AAA", "stroke-width": 2});
  };

  var makeLaunchTube = function() {
    if (!launchTube) launchTube = r.path();
    var bottom = noseStart+noseLength+bodyLength+neckLength;
    launchTube.attr({path: [
	'M', centreX-bore+2, bottom+40,
	'l', 0, -(launchTubeLength+40),
	'c', 0, -bore/4, (bore-2)*2, -bore/4, (bore-2)*2, 0,
	'l', 0, launchTubeLength+40,
	'c', 0, bore/4, -(bore-2)*2, bore/4, -(bore-2)*2, 0
      ]});
    launchTube.attr({fill: "#0F0", "fill-opacity": 0.8, stroke: null});
    return launchTube;
  };

  var makeWater = function() {
    if (!water) water = r.path();
    var curvature = (bodyLength/2-waterLevel)/(bodyLength/2);
    water.attr({path: nozzlePath() +
      [	'l', 0, -waterLevel,
	'c', 0, curvature*radius/8, -radius*2, curvature*radius/8, -radius*2, 0,
	'c', 0, -curvature*radius/8, radius*2, -curvature*radius/8, radius*2, 0,
	'c', 0, curvature*radius/8, -radius*2, curvature*radius/8, -radius*2, 0,
        // 'l', -radius*2, 0,
	'l', 0, waterLevel
      ]
    });
    water.attr({fill: "#03F", "fill-opacity": 0.2, "stroke-opacity": 0.1});
    water.toFront();
    return water;
  };

  var dragHandlers = function() {

    // Make body draggable to change radius
    body.draggable();
    body.dragStart = function(x, y, down, move) {
      var startRadius = radius;
      var startLength = bodyLength;
      var xDist = 0;
      var yDist = 0;
      var elongatingBody = y > noseStart+noseLength+bodyLength/3 ? true : false;
      return {
	dragUpdate: function(dragging_over, dx, dy, event) {
	  xDist = xDist+dx;
	  yDist = yDist+dy;
	  var new_r = startRadius+xDist;
	  if (new_r > bore && new_r < 400)
	    radius = new_r;
	  var new_l = startLength + yDist;
	  if (elongatingBody && new_l > 10 && new_l < 2000)
	  {
	    bodyLength = new_l;
	    if (launchTubeLength > bodyLength+noseLength+neckLength-20)
	      launchTubeLength = bodyLength+noseLength+neckLength-20;
	  }
	  makeRocket();
	},
	dragCancel: function() {
	  radius = startRadius;
	  bodyLength = startLength;
	  makeRocket();
	},
	hide: function() { },
	show: function() { }
      };
    };

    // Make nose draggable to change length
    nose.draggable();
    nose.dragStart = function(x, y, down, move) {
      var startNoseLength = noseLength;
      var yDist = 0;
      return {
	dragUpdate: function(dragging_over, dx, dy, event) {
	  yDist = yDist+dy;
	  var new_l = startNoseLength+yDist;
	  if (new_l >= -radius/8-4 && new_l < 800)
	    noseLength = new_l;
	  if (launchTubeLength > bodyLength+noseLength+neckLength-20)
	    launchTubeLength = bodyLength+noseLength+neckLength-20;
	  makeRocket();
	},
	dragCancel: function() {
	  noseLength = startNoseLength;
	  makeRocket();
	},
	hide: function() { },
	show: function() { }
      };
    };

    // Make water draggable to change fill
    water.draggable();
    water.dragStart = function(x, y, down, move) {
      var startWaterLevel = waterLevel;
      var startNeckReduction = neckReduction;
      var startNeckRoundness = neckRoundness;
      var draggingWater = y < noseStart+noseLength+bodyLength ? true : false;
      var yDist = 0;
      var xDist = 0;
      return {
	dragUpdate: function(dragging_over, dx, dy, event) {
	  yDist = yDist+dy;
	  xDist = xDist+dx;
	  if (draggingWater) {
	    var new_l = startWaterLevel-yDist;
	    if (new_l >= 0 && new_l <= bodyLength)
	      waterLevel = new_l;
	  } else {
	    var new_round = startNeckRoundness+xDist/100.0;
	    if (new_round >= 0 && new_round <= 1.0)
	      neckRoundness = new_round;
	    var new_reduction = startNeckReduction+yDist;
	    if (new_reduction >= radius/8 && new_reduction <= 400) {
	      neckReduction = new_reduction;
	      neckLength = neckReduction+radius/4;
	      if (launchTubeLength > bodyLength+noseLength+neckLength-20)
		launchTubeLength = bodyLength+noseLength+neckLength-20;
	    }
	  }
	  makeRocket();
	},
	dragCancel: function() {
	  waterLevel = startWaterLevel;
	  makeRocket();
	},
	hide: function() { },
	show: function() { }
      };
    };

    // Make launch tube draggable to change fill
    launchTube.draggable();
    launchTube.dragStart = function(x, y, down, move) {
      var startLaunchTubeLength = launchTubeLength;
      var startBore = bore;
      var yDist = 0;
      var xDist = 0;
      return {
	dragUpdate: function(dragging_over, dx, dy, event) {
	  yDist = yDist+dy;
	  xDist = xDist+dx;
	  var new_l = startLaunchTubeLength-yDist;
	  if (new_l >= 0 && new_l <= noseLength+bodyLength+neckLength-20)
	    launchTubeLength = new_l;
	  var new_b = startBore+xDist/5;
	  if (new_b >= 3 && new_b <= radius-2)
	    bore = new_b;
	  makeRocket();
	},
	dragCancel: function() {
	  launchTubeLength = startLaunchTubeLength;
	  makeRocket();
	},
	hide: function() { },
	show: function() { }
      };
    };

  };

  var makeRocket = function() {
    makeNose();
    makeBody();
    makeNozzle();
    makeLaunchTube();
    makeWater();
  }
  makeRocket();
  dragHandlers();
};

Flight = function(div) {
  var paper = Raphael(div, '100%', '100%');
};
