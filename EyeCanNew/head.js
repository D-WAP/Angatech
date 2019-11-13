
var eyecanHead = {

  fixedSize : 50,
  mobileSize : 70,

  xScale : 200.0,
  yScale : 200.0,
  zScale : 80.0,
  rollScale : 5.0,
  pitchScale : 600.0,
  yawScale : 800.0,

  zOffset : -1.0,

  xSmoothed : 0.0,
  ySmoothed : 0.0,
  xLearningRate : 0.5,
  yLearningRate : 0.5,

  pitchOffset : 0.65,
  pitchSmoothed : 0.0,
  pitchLearningRate : 0.15,

  rollSmoothed : 0.0,
  rollLearningRate : 0.5,

  yawSmoothed : 0.0,
  yawLearningRate : 0.25,

//  config : null,
  paintHeadPose : function() {
    var paintHeadPose = parseInt( eyecanContent.getConfig( "browser.canvas.paintHeadPose" ) );
    if( paintHeadPose == 0 ) {
      return false; // has been disabled, e.g. by the page as an app or game has their own UI.
    }
    return true;
  },

  paint : function() {

    if( eyecanHead.paintHeadPose() == false ) {
      return; // has been disabled, e.g. by the page as an app or game has their own UI.
    }

    var x = parseFloat( eyecanContent.getConfig( "state.head.x" ) );
    var y = parseFloat( eyecanContent.getConfig( "state.head.y" ) );
    var z = parseFloat( eyecanContent.getConfig( "state.head.z" ) );
    var ro = parseFloat( eyecanContent.getConfig( "state.head.roll" ) );
    var pi = parseFloat( eyecanContent.getConfig( "state.head.pitch" ) );
    var ya = parseFloat( eyecanContent.getConfig( "state.head.yaw" ) );

    var errors = eyecanContent.getConfig( "validation.errors" );

    var faceError = true;
    if( errors.indexOf( 'F' ) === -1 ) {
      faceError = false;
    }

    // clear canvas and apply standard line style:
    eyecanContent.canvasContext.clearRect( 0,0, eyecanContent.canvas.width, eyecanContent.canvas.height );
    eyecanContent.canvasContext.lineCap = "round";
    eyecanContent.canvasContext.lineWidth = 8;

    eyecanContent.canvasContext.fillStyle = "rgba( 255, 0, 0, 0.4)";
    //console.log( "err: "+errors );
    //eyecanContent.canvasContext.fillText( "Errr:"+errors, 500,500 );

    if( faceError ) {
      return;
    }

    // update smoothed variables:
    eyecanHead.xSmoothed = eyecanUtil.lerp( eyecanHead.xSmoothed, x, eyecanHead.xLearningRate );
    eyecanHead.ySmoothed = eyecanUtil.lerp( eyecanHead.ySmoothed, y, eyecanHead.yLearningRate );
    eyecanHead.pitchSmoothed = eyecanUtil.lerp( eyecanHead.pitchSmoothed, pi, eyecanHead.pitchLearningRate );
    eyecanHead.  yawSmoothed = eyecanUtil.lerp( eyecanHead.  yawSmoothed, ya, eyecanHead.  yawLearningRate );
    eyecanHead. rollSmoothed = eyecanUtil.lerp( eyecanHead. rollSmoothed, ro, eyecanHead. rollLearningRate );
    x = eyecanHead.xSmoothed;
    y = eyecanHead.ySmoothed;
    pi = eyecanHead.pitchSmoothed;
    ya = eyecanHead.  yawSmoothed;
    ro = eyecanHead. rollSmoothed;

    eyecanContent.canvasContext.fillStyle = "rgba( 0, 255, 0, 0.4)";
    eyecanContent.canvasContext.strokeStyle = "rgba(0, 255, 0, 0.4)";

    var w = screen.width;
    var h = screen.height;
    var size = eyecanHead.fixedSize + (Math.max(0.0, z+eyecanHead.zOffset) * eyecanHead.zScale);
    
    var xc = w * 0.5;
    var yc = h * 0.5;
    
    var xh = xc - x * eyecanHead.xScale;
    var yh = yc + y * eyecanHead.yScale;

    var t = ro * eyecanHead.rollScale;
    var p  = eyecanUtil.rotate( size, 0, -( t + Math.PI * 0.5 ) );
    var p2 = eyecanUtil.rotate( size, 0, -( t ) );

    var xh2 = xh - ya * eyecanHead.yawScale;
    var yh2 = yh + (pi-eyecanHead.pitchOffset) * eyecanHead.pitchScale;

//console.log( "x,y="+w+" ,"+h );

    eyecanContent.canvasContext.beginPath();

    eyecanContent.canvasContext.moveTo( xh -size, yh );
    eyecanContent.canvasContext.lineTo( xh +size, yh );
    eyecanContent.canvasContext.moveTo( xh, yh -size );
    eyecanContent.canvasContext.lineTo( xh, yh +size );

    eyecanContent.canvasContext.stroke();
    eyecanContent.canvasContext.beginPath();

    eyecanContent.canvasContext.strokeStyle = "rgba(0, 0, 255, 0.4)";
    eyecanContent.canvasContext.fillStyle = "rgba(0, 0, 255, 0.4)";

//    eyecanContent.canvasContext.moveTo( xh, yh );

//    eyecanContent.canvasContext.moveTo( xh2 -size, yh2 );
//    eyecanContent.canvasContext.lineTo( xh2 +size, yh2 );
//    eyecanContent.canvasContext.moveTo( xh2, yh2 -size );
//    eyecanContent.canvasContext.lineTo( xh2, yh2 +size );

    eyecanContent.canvasContext.moveTo( xh2-p.x, yh2-p.y );
    eyecanContent.canvasContext.lineTo( xh2+p.x, yh2+p.y );

    eyecanContent.canvasContext.moveTo( xh2-p2.x, yh2-p2.y );
    eyecanContent.canvasContext.lineTo( xh2+p2.x, yh2+p2.y );

    eyecanContent.canvasContext.stroke();
    eyecanContent.canvasContext.beginPath();

    eyecanContent.canvasContext.arc( xh2+p.x, yh2+p.y, 10, 0, 2 * Math.PI, false );
    eyecanContent.canvasContext.fill();

    //eyecanContent.canvasContext.fillText( "yaw:"+ya, 500,500 );
    //eyecanContent.canvasContext.fillText( "z:"+z, 500,500 );
        
/*    var xOffset = parseInt( eyecanContent.getConfig( "browser.document.offset.x" ) );
    var yOffset = parseInt( eyecanContent.getConfig( "browser.document.offset.y" ) );
    var xWindow = window.screenX;
    var yWindow = window.screenY;
//eyecanContent.xMouseScreen -xOffset -xWindow, eyecanContent.yMouseScreen -yOffset -yWindow
    var xyCanvas = eyecanContent.getCanvasCoordinatesMouse(); 
    var xCanvas = xyCanvas.x; 
    var yCanvas = xyCanvas.y;
    eyecanContent.canvasContext.arc( xCanvas, yCanvas, 30, 0, 2 * Math.PI, false);*/
  },

  setup : function() {
  }

};

eyecanHead.setup();


