
var eyecanLearning = {

  // Gui elements / behaviour
  fontSize : 32,
  clickTimeout : 400,
  clickSize : 50,
  gazeMinSize : 90,//60,
  gazeMaxScreenFrac : 0.5,
  maxConfidence : 8.0, // for simplePoly: 8.0, for compountPoly: 10.0,

  // Head  
  xScale : 250.0,
  yScale : 350.0,
  headLimit : 100.0,
  headLearningRate : 0.5,
  xHeadOrigin : null,
  yHeadOrigin : null,
  xHead : null,
  yHead : null,

  // Gaze
  xSmoothed : 0.0,
  ySmoothed : 0.0,
  cSmoothed : 0.0, 
  
  xyLearningRate : 0.25,
   cLearningRate : 0.05,

  onMouseDown : function() {
    eyecanLearning.headReset();    
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Head tracker
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  headReset : function() {
    eyecanLearning.xHeadOrigin = null;
    eyecanLearning.yHeadOrigin = null;
    eyecanLearning.xHead = null;
    eyecanLearning.yHead = null;
  },

  headUpdate : function() {
    // if not set, then copy:
    var x = parseFloat( eyecanContent.getConfig( "state.head.x" ) );
    var y = parseFloat( eyecanContent.getConfig( "state.head.y" ) );
    //var z = parseFloat( eyecanContent.getConfig( "state.head.z" ) );
    //var ro = parseFloat( eyecanContent.getConfig( "state.head.roll" ) );
    //var pi = parseFloat( eyecanContent.getConfig( "state.head.pitch" ) );
    //var ya = parseFloat( eyecanContent.getConfig( "state.head.yaw" ) );

    if( eyecanLearning.xHeadOrigin == null ) {
      eyecanLearning.xHeadOrigin = x;
      eyecanLearning.yHeadOrigin = y;
      eyecanLearning.xHead       = x;
      eyecanLearning.yHead       = y;
    }

    // Smoothed update
    var offset = 50.0; // shift to positive range
    eyecanLearning.xHead = eyecanUtil.lerp( eyecanLearning.xHead+offset, x+offset, eyecanLearning.headLearningRate ) -offset;
    eyecanLearning.yHead = eyecanUtil.lerp( eyecanLearning.yHead+offset, y+offset, eyecanLearning.headLearningRate ) -offset;
  },

  headGet : function() {
    var dx = - (eyecanLearning.xHead - eyecanLearning.xHeadOrigin) * eyecanLearning.xScale;
    var dy = + (eyecanLearning.yHead - eyecanLearning.yHeadOrigin) * eyecanLearning.yScale; // to pixels

    dx = Math.min( eyecanLearning.headLimit, Math.max( -eyecanLearning.headLimit, dx ) );
    dy = Math.min( eyecanLearning.headLimit, Math.max( -eyecanLearning.headLimit, dy ) );

    var coordinate = { x:dx, y:dy }; 
    return coordinate;
  },

  paintClick : function() {

    var xyCanvas = eyecanContent.getCanvasCoordinatesMouseDown();
    var xCanvas = xyCanvas.x; 
    var yCanvas = xyCanvas.y;

    var trackingSuspended = parseInt( eyecanContent.getConfig( "state.trackingSuspended" ) );
    var calibrationActive = eyecanContent.getConfig( "calibration.active" );

    var timestamp = eyecanUtil.getTimestamp();
    var elapsed = timestamp - eyecanContent.tMouseScreenDown;

    if( elapsed < eyecanLearning.clickTimeout ) { 
      var elapsedFraction = 1.0 - ( elapsed / eyecanLearning.clickTimeout );
      elapsedFraction = Math.max( 0.0, elapsedFraction );

      var width = 8;
      var style = "rgba( 0, 0, 255, " + elapsedFraction +" )";
      if( trackingSuspended == 1 ) {
        style = "rgba( 255, 0, 0, 0.4 )";
      }
      eyecanLearning.paintCircle( xCanvas, yCanvas, eyecanLearning.clickSize, style, width );
    }
    
    // indicate error and calib active
    if( calibrationActive.length > 0 ) {
      var width = 1;
      var style = "rgba( 0, 0, 0, 0.5 )";
      eyecanLearning.paintCircle( xCanvas, yCanvas, eyecanLearning.clickSize * 0.9, style, width );
    }

    // encourage head movement by painting a line from mouse down point to 
    if( eyecanContent.bMouseDown ) {
      var r = 10;
      var offset = eyecanLearning.headGet();
      var xCanvasHead = xCanvas + offset.x;
      var yCanvasHead = yCanvas + offset.y;
      eyecanContent.canvasContext.lineCap = "round";
      eyecanContent.canvasContext.lineWidth = 8;
      eyecanContent.canvasContext.strokeStyle = "rgba( 0, 127, 0, 0.5 )";
      eyecanContent.canvasContext.beginPath();
      eyecanContent.canvasContext.moveTo( xCanvas, yCanvas );
      eyecanContent.canvasContext.lineTo( xCanvas, yCanvasHead );
      eyecanContent.canvasContext.lineTo( xCanvasHead, yCanvasHead );
      eyecanContent.canvasContext.stroke();
      eyecanContent.canvasContext.beginPath();
      eyecanContent.canvasContext.arc( xCanvasHead, yCanvasHead, r, 0, 2 * Math.PI, false);
      eyecanContent.canvasContext.fill();
    }    
  },

  paintCircle : function( x, y, r, style, width ) {
    eyecanContent.canvasContext.beginPath();
    eyecanContent.canvasContext.lineCap = "round";
    eyecanContent.canvasContext.lineWidth = width;
    eyecanContent.canvasContext.strokeStyle = style
    eyecanContent.canvasContext.arc( x, y, r, 0, 2 * Math.PI, false);
    eyecanContent.canvasContext.stroke();
  },

  paintGaze : function() {

    var trackingSuspended = parseInt( eyecanContent.getConfig( "state.trackingSuspended" ) );
    var calibrationStatus = parseInt( eyecanContent.getConfig( "calibration.status" ) );
    var calibrationActive = eyecanContent.getConfig( "calibration.active" );

    if( ( calibrationStatus == 0 ) || ( trackingSuspended == 1 ) ) {
//console.log( "cs: "+calibrationStatus + " ts="+trackingSuspended );
      return;
    }

    var x = parseFloat( eyecanContent.getConfig( "state.gaze.estimate.x" ) ); // screen coords
    var y = parseFloat( eyecanContent.getConfig( "state.gaze.estimate.y" ) ); // screen coords
    var c = eyecanContent.getConfig( "state.calibration.confidence" ); // empty if not available
    if( c ) {
      c = parseFloat( c );
      var validConfidence = c > 0;
    }
    else {
      c = eyecanLearning.maxConfidence;
      var validConfidence = false;
    }

    x = Math.max( 0, Math.min( screen. width-1, x ) );
    y = Math.max( 0, Math.min( screen.height-1, y ) );

    // condition c into a continuous unit value
    if( c > eyecanLearning.maxConfidence ) {
      c = eyecanLearning.maxConfidence;
    }
    if( c < 0 ) c = eyecanLearning.maxConfidence;
    var cUnit = c / eyecanLearning.maxConfidence;

    // smooth these measurements
    eyecanLearning.xSmoothed = eyecanUtil.lerp( eyecanLearning.xSmoothed, x, eyecanLearning.xyLearningRate );
    eyecanLearning.ySmoothed = eyecanUtil.lerp( eyecanLearning.ySmoothed, y, eyecanLearning.xyLearningRate );
    eyecanLearning.cSmoothed = eyecanUtil.lerp( eyecanLearning.cSmoothed, cUnit, eyecanLearning.cLearningRate );

//console.log( "c:"+c+" cu:"+cUnit );
    var gazeMaxSize = screen.height * eyecanLearning.gazeMaxScreenFrac;
    var radiusRange = gazeMaxSize - eyecanLearning.gazeMinSize;
    var radius = ( radiusRange * eyecanLearning.cSmoothed ) + eyecanLearning.gazeMinSize;
    var elapsedFraction = 0.4;

    var xyCanvas = eyecanContent.getCanvasCoordinates( eyecanLearning.xSmoothed, eyecanLearning.ySmoothed );
    var xCanvas = xyCanvas.x; 
    var yCanvas = xyCanvas.y;
    
    var width = 8;
    var style = "rgba( 255, 0, 0, 0.4 )";
    if( !validConfidence ) {
      style = "rgba( 0, 0, 0, 0.4 )";
    }
    eyecanLearning.paintCircle( xCanvas, yCanvas, radius, style, width );
    if( calibrationActive.length > 0 ) {
      width = 1;
      style = "rgba( 0, 0, 0, 0.5 )";
      eyecanLearning.paintCircle( xCanvas, yCanvas, radius * 0.9, style, width );
    }
  },

  paintErrors : function() {
    var trackingSuspended = parseInt( eyecanContent.getConfig( "state.trackingSuspended" ) );
    var calibrationStatus = parseInt( eyecanContent.getConfig( "calibration.status" ) );
    var errors = eyecanContent.getConfig( "validation.errors" );

    //var faceError = true;
    //if( errors.indexOf( 'F' ) === -1 ) {
    //  faceError = false;
    //}
    var errorMessage = "";
    if( errors.indexOf( "F" ) >= 0 ) {
      errorMessage = "Warning: Didn't see a face.";
    }
    else if( calibrationStatus == 0 ) { // have a face, but not tracking
      errorMessage = "Not yet calibrated.";
    }
    else if( trackingSuspended > 0 ) { // have a face, but not tracking
      errorMessage = "Tracking suspended.";
    }
    else { // generic warnings:
      if( errors.length > 0 ) {
        errorMessage = "Notes: " + errors;
      }
    }

    eyecanContent.canvasContext.fillStyle = "rgba( 255, 0, 0, 0.7 )";
    eyecanContent.canvasContext.font = eyecanLearning.fontSize + "px Arial";

    var textMetrics = eyecanContent.canvasContext.measureText( errorMessage );

    var xText = screen.width - textMetrics.width - 20; // centre aligned within rect
    var yText = 0 + eyecanLearning.fontSize;
    var sText = errorMessage;

    eyecanContent.canvasContext.fillText( sText, xText, yText );
  },

  paintLearning : function() {
    var paintLearning = parseInt( eyecanContent.getConfig( "browser.canvas.paintLearning" ) );
    if( paintLearning == 0 ) {
      return false; // has been disabled, e.g. by the page as an app or game has their own UI.
    }
    return true;
  },

  paint : function() {

    eyecanLearning.headUpdate();

    eyecanContent.canvasContext.clearRect( 0,0, eyecanContent.canvas.width, eyecanContent.canvas.height );

    eyecanLearning.paintClick();
    eyecanLearning.paintGaze();
    eyecanLearning.paintErrors();
  },

  setup : function() {
  }

};

eyecanLearning.setup();


