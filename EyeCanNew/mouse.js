
///////////////////////////////////////////////////////////////////////////////
// Mouse emulation mode. 
//
// Takes control of the mouse using head pose. Note that actual mouse control
// is done by the background script. This page simply shows that it is under
// control by showing actions and highlighting square brackets around the 
// pointer.
//
// UI features:
// - If you hold still, it will eventually click. Show a pie that rotates 
//   after x seconds until click on completion. The actual click is implemented
//   in the background. The pie should be small and centred on the cursor
//
// - When active put small blue square brackets around the cursor to show it's
//   being controlled.
//
// - When a nod to disable or reset the system is registered, there is a delay
//   before it zeroes or disables. Show a semi-circle on left/right sides of
//   screen respectively to indicate this action is happening and allow user
//   to centre their head.
//
///////////////////////////////////////////////////////////////////////////////
var eyecanMouse = {

  TIMEOUT_BACK : 1500,
  TIMEOUT_SCROLL : 500,
  TIMEOUT_CLICK : 1000,
  TIMEOUT_EXTEND : 3000,

  // the painting state
  state : "cursor",
  dwellStartTime : 0,

  roll : 0.0,
  rollLearningRate : 0.04,
  rollThreshold : 0.2,

  // TODO change roll commands to measured time
  commandReset : false, 
  commandSuspend : false,

  canvasXY : { x:0, y:0 },
  documentXY : { x:0, y:0 },

  stateTimer : new eyecanTimer(),

  setState : function( stateString, durationMsec ) {
    if(    stateString != "cursor"
        && stateString != "initialising"
        && stateString != "suspended"
        // && s != stateReady
        ) {
        throw new Error( "Invalid state" );
    }

    eyecanMouse.state = stateString;

    if( typeof durationMsec != 'undefined' ) {
      eyecanMouse.stateTimer.setDuration( durationMsec );
      eyecanMouse.stateTimer.reset();
      console.log( "Timer reset" );
    }
  },

  setConfigInitStatus : function( s ) {
    if(    s != "uninitialised"
        && s != "animating"
        && s != "zeroing"
        && s != "initialised"
        ) {
        throw new Error( "Invalid initStatus" );
    }
    eyecanContent.setConfig( "mouseEmulator.initialisationStatus", s );
  },

  getConfigInitStatus : function() {
    return eyecanContent.getConfig( "mouseEmulator.initialisationStatus" );
  },

  paintInit : function( ctx ) { 
    // paints the initialization cue - a shrinking circle that forces the view to the centre
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.beginPath();    
    ctx.rect( 0,0, ctx.canvas.width, ctx.canvas.height );
    ctx.fill();

    var oldMode = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'destination-out';

    var xy = eyecanContent.getCanvasCoordinates( screen.width/2, screen.height/2 );
    var d = Math.sqrt( screen.width*screen.width + screen.height*screen.height );
    var frac = eyecanMouse.stateTimer.elapsedFrac();

    var radiusMin = screen.height/20;
    var radiusMax = d/2;
    if( frac < 0.6 ) { // shrink
      frac = frac / 0.6; // scale from 0 to 1
      var radius = ( 1 - frac ) * ( radiusMax - radiusMin ) + radiusMin;
    }
    else if( frac < 0.8 ) { // dwell a little bit
      eyecanMouse.setConfigInitStatus( "zeroing" );
      var radius = radiusMin;
    }
    else { // expand
      eyecanMouse.setConfigInitStatus( "initialised" );
      frac = (frac-0.8)/0.2; // scale from 0 to 1
      var radius = frac * ( radiusMax - radiusMin ) + radiusMin;
    }

    console.log( "Timer elapsedFrac(): " + eyecanMouse.stateTimer.elapsedFrac() );

    ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
    ctx.beginPath();
    ctx.arc( xy.x, xy.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.globalCompositeOperation = oldMode;
  },

  truncate : function( value, lo, hi ) {
    return Math.min( Math.max( value, lo ), hi );
  },

  updateCursor : function() {
    var screenX = parseFloat( eyecanContent.getConfig( "mouseEmulator.cursor.x" ) );
    var screenY = parseFloat( eyecanContent.getConfig( "mouseEmulator.cursor.y" ) );
    screenX += screen.width /2;
    screenY += screen.height/2;

    var canvasXY = eyecanContent.getCanvasCoordinates( screenX, screenY );

    eyecanMouse.canvasXY.x = eyecanMouse.truncate( canvasXY.x, 0, eyecanContent.canvas.width -1 );
    eyecanMouse.canvasXY.y = eyecanMouse.truncate( canvasXY.y, 0, eyecanContent.canvas.height-1 );

    eyecanMouse.documentXY.x = eyecanMouse.canvasXY.x / eyecanCoord.devicePixelRatio();
    eyecanMouse.documentXY.y = eyecanMouse.canvasXY.y / eyecanCoord.devicePixelRatio();
  },

  paintCursor : function( ctx ) {
    // console.log( "paintCursor" );


    // Get nearest element
    var el = document.elementFromPoint( eyecanMouse.documentXY.x, eyecanMouse.documentXY.y );
    if( el ) {
      ctx.strokeStyle = "rgba(0, 0, 255, "+0.5+")";
      ctx.lineWidth = 2;

      var bb = el.getBoundingClientRect();

      ctx.beginPath();
      ctx.rect(  bb.left*eyecanCoord.devicePixelRatio(),
                 bb.top *eyecanCoord.devicePixelRatio(),
                (bb.right-bb.left)*eyecanCoord.devicePixelRatio(),
                (bb.bottom-bb.top )*eyecanCoord.devicePixelRatio() );
      ctx.stroke();
    }


    var alpha = parseFloat( eyecanContent.getConfig( "mouseEmulator.adaptive.alpha" ) );

    // convert alpha into size
    var radius = alpha * 35 + 25;
    var opacity = (1 - alpha) * (1 - 0.3) + 0.3;

    var x = eyecanMouse.canvasXY.x;
    var y = eyecanMouse.canvasXY.y;
    var r = 10;

    var paintTimer = false;
    var now = new Date().getTime();
//    if( eyecanMouse.dwellStartTime == 0 ) { // ie moving, not dwelling
    if( alpha > 0 ) { // ie moving, not dwelling
      ctx.fillStyle = "rgba(255, 0, 0, "+opacity+")"; 
    }
    else if( eyecanMouse.dwellStartTime > now ) { // then we just clicked - waiting for load
      ctx.fillStyle = "rgba(0, 150, 0, 0.5 )";
    }
    else { // we are dwelling and waiting.
      ctx.fillStyle = "rgba(255, 0, 0, "+opacity+")"; 
      paintTimer = true;
    }
    ctx.beginPath();
    ctx.arc( x,y, radius, 0, 2 * Math.PI, false );
    ctx.fill();

    // when dwelling pending a click, paint a visual timer:
    if( paintTimer ) {
      var elapsed = ( now - eyecanMouse.dwellStartTime ) / eyecanMouse.TIMEOUT_CLICK;
      var radians = elapsed * Math.PI * 2.0; // now we have the arc in radians
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba( 0, 150, 0, 0.6 )";
      ctx.arc( x,y, radius, 0-(Math.PI*0.5), radians-(Math.PI*0.5), false );
      ctx.stroke();
    }

    // paint a small crosshairs on top
    ctx.beginPath();
    ctx.lineWidth = "1";
    ctx.strokeStyle = "rgba( 0, 0, 0, 1 )";
    ctx.moveTo( x-r, y );
    ctx.lineTo( x+r, y );
    ctx.moveTo( x, y-r );
    ctx.lineTo( x, y+r );
    ctx.stroke();

    //eyecanMouse.dwellHandler( documentX, documentY, canvasXY );
  },

  calculateClientXY: function(element, documentX, documentY) {
    var rect = element.getBoundingClientRect();
    return {
      x: documentX - rect.left,
      x: documentY - rect.top
    };
  },

  click : function( documentX, documentY ) {
    console.log( "eyecan: Mouse click." );

    var el = document.elementFromPoint(documentX, documentY);
    if( !el ) {
      console.log( "eyecan: No element to click." );
    }
    else {
      var rect = el.getBoundingClientRect();      
      var clientXY = eyecanMouse.calculateClientXY( el, documentX, documentY );
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window,
          1, 0, 0,
          clientXY.x, clientXY.y,
          false, false, false, false, 0, null);

      el.dispatchEvent(evt);
    }
  },

  dwellHandler : function() {// documentX, documentY, canvasXY ) {
    // console.log( eyecanMouse.dwellStartTime );
    var documentX = eyecanMouse.documentXY.x;
    var documentY = eyecanMouse.documentXY.y; 
    var canvasXY = eyecanMouse.canvasXY;

    var alpha = parseFloat( eyecanContent.getConfig( "mouseEmulator.adaptive.alpha" ) );

    if( alpha == 0 || canvasXY.x == 0 || canvasXY.y == 0 || canvasXY.y >= eyecanContent.canvas.height-1 ) {
      var now = new Date().getTime();
      if( eyecanMouse.dwellStartTime == 0 ) {
        console.log( "dwellStartTime set to now" );
        eyecanMouse.dwellStartTime = now;
      }
      else {
        if( documentX == 0 ) { // back button
          eyecanMouse.paintPendingBack();
          if( now - eyecanMouse.dwellStartTime > eyecanMouse.TIMEOUT_BACK ) {
            window.history.back();
            eyecanMouse.dwellStartTime = now;
          }
        }
        else if( canvasXY.y == 0 ) {
          eyecanMouse.paintPendingScrollUp();
          if( now - eyecanMouse.dwellStartTime > eyecanMouse.TIMEOUT_SCROLL ) {
            window.scrollBy(0, -10);
          }
        }
        else if( canvasXY.y >= eyecanContent.canvas.height-1 ) {
          eyecanMouse.paintPendingScrollDown();
          if( now - eyecanMouse.dwellStartTime > eyecanMouse.TIMEOUT_SCROLL ) {
            window.scrollBy(0, 10);
          }
        }
        else { 
          if( now - eyecanMouse.dwellStartTime > eyecanMouse.TIMEOUT_CLICK ) {
            eyecanMouse.click( documentX, documentY );
            eyecanMouse.dwellStartTime = now + eyecanMouse.TIMEOUT_EXTEND; // add some extra to the dwell time [DAVE: WTF?? ah, stop another click while document loads?]
          }
        }
      }
    }
    else {
      eyecanMouse.dwellStartTime = 0;
    }
  },

  paintPendingBack : function() {
    // a red bar at left
    var w = eyecanContent.canvas.height * 0.1;
    var h = eyecanContent.canvas.height;
    eyecanContent.canvasContext.fillStyle = "rgba( 255, 0, 0, 0.3 )";
    eyecanContent.canvasContext.fillRect( 0,0, w, h ); 
  },
  paintPendingScrollUp : function() {
    // a blue bar at top
    var w = eyecanContent.canvas.width;
    var h = eyecanContent.canvas.height * 0.1;
    var y = 0;
    eyecanContent.canvasContext.fillStyle = "rgba( 0, 0, 255, 0.3 )";
    eyecanContent.canvasContext.fillRect( 0,y, w, h ); 
  },
  paintPendingScrollDown : function() {
    // a blue bar at bottom
    var w = eyecanContent.canvas.width;
    var h = eyecanContent.canvas.height * 0.1;
    var y = eyecanContent.canvas.height - h;
    eyecanContent.canvasContext.fillStyle = "rgba( 0, 0, 255, 0.3 )";
    eyecanContent.canvasContext.fillRect( 0,y, w, h ); 
  },
  paintPendingReset : function() {
    // a triangle lower left (dark grey)
    var x1 = 0;
    var y1 = eyecanContent.canvas.height * 0.5;
    var x2 = y1;
    var y2 = eyecanContent.canvas.height;
    var x3 = x1;
    var y3 = y2;

    eyecanContent.canvasContext.strokeStyle = "rgba( 0, 0, 0, 0.3 )";
    eyecanContent.canvasContext.fillStyle = "rgba( 0, 0, 0, 0.3 )";
    eyecanContent.canvasContext.beginPath();
    eyecanContent.canvasContext.moveTo( x1, y1 );
    eyecanContent.canvasContext.lineTo( x2, y2 );
    eyecanContent.canvasContext.lineTo( x3, y3 );
    eyecanContent.canvasContext.lineTo( x1, y1 );
    eyecanContent.canvasContext.closePath();
    eyecanContent.canvasContext.fill();
    eyecanContent.canvasContext.stroke();
  },
  paintPendingSuspend : function() {
    // a triangle lower right (red)
    var x1 = eyecanContent.canvas.width;
    var y1 = eyecanContent.canvas.height * 0.5;
    var x2 = eyecanContent.canvas.width - y1;
    var y2 = eyecanContent.canvas.height;
    var x3 = x1;
    var y3 = y2;

    eyecanContent.canvasContext.strokeStyle = "rgba( 255, 0, 0, 0.3 )";
    eyecanContent.canvasContext.fillStyle = "rgba( 255, 0, 0, 0.3 )";
    eyecanContent.canvasContext.beginPath();
    eyecanContent.canvasContext.moveTo( x1, y1 );
    eyecanContent.canvasContext.lineTo( x2, y2 );
    eyecanContent.canvasContext.lineTo( x3, y3 );
    eyecanContent.canvasContext.lineTo( x1, y1 );
    eyecanContent.canvasContext.closePath();
    eyecanContent.canvasContext.fill();
    eyecanContent.canvasContext.stroke();
  },

  paint : function() {
    eyecanContent.canvasContext.clearRect( 0,0, eyecanContent.canvas.width, eyecanContent.canvas.height );
    // eyecanContent.canvasContext.fillStyle = "rgba(255, 0, 0, 0.5)";
    // eyecanContent.canvasContext.strokeStyle = "rgba(255, 0, 0, 0.5)";
    // eyecanContent.canvasContext.lineWidth = 3;
    // eyecanContent.canvasContext.beginPath();
    // var xyCanvas = eyecanContent.getCanvasCoordinatesMouse(); 
    // var xCanvas = xyCanvas.x; 
    // var yCanvas = xyCanvas.y;
    // eyecanContent.canvasContext.arc( xCanvas, yCanvas, 30, 0, 2 * Math.PI, false);
    // eyecanContent.canvasContext.stroke();

    // Paint depending on current state
    if( eyecanMouse.state == "initialising" )
    {
      eyecanMouse.paintInit( eyecanContent.canvasContext );
    }

    if( eyecanMouse.state == "cursor" )
    {      
      eyecanMouse.updateCursor();
      eyecanMouse.paintCursor( eyecanContent.canvasContext );
      eyecanMouse.dwellHandler();
    }

    if( eyecanMouse.state == "suspended" )
    {      
      // nothing to paint
    }


    // State machine logic
    // -----------------------------------------------------------------------------------

    // See if initilisation sequence is complete
    if( eyecanMouse.state == "initialising" )
    {
      // Move on after delay
      if( eyecanMouse.stateTimer.hasElapsed() ) {        
        // eyecanMouse.setConfigInitStatus( "initialised" ); // this is set inside the animation code
        eyecanMouse.setState( "cursor" );
      }
    }

    // If no other content script has started initialisation sequence, then this script should start it
    if( eyecanMouse.state == "cursor" ) {
      var initStatus = eyecanMouse.getConfigInitStatus();
      if( initStatus == "uninitialised" ) {
        eyecanMouse.setConfigInitStatus( "animating" );
        eyecanMouse.setState( "initialising", 6000 );
      }
    }

    // always check for the head roll reset/suspend commands, whether active or not.
    // see if the user commands a reset or suspend:
    var roll = parseFloat( eyecanContent.getConfig( "state.head.roll" ) );
    var offset = 50.0; // shift to positive range
    eyecanMouse.roll = eyecanUtil.lerp( eyecanMouse.roll+offset, roll+offset, eyecanMouse.rollLearningRate ) -offset;

    if( roll < (-eyecanMouse.rollThreshold) ) {
      eyecanMouse.paintPendingSuspend();
    }
    else if( roll > eyecanMouse.rollThreshold ) {
      eyecanMouse.paintPendingReset();
    }

    //console.log( "state="+eyecanMouse.state + " roll="+ro + " smooth:"+eyecanMouse.roll );   
    if( eyecanMouse.roll < (-eyecanMouse.rollThreshold) ) {
      //console.log( "command suspend??" );   
      if( eyecanMouse.commandSuspend == false ) {
        //console.log( "command suspend" );   
        eyecanMouse.commandSuspend = true;
        eyecanMouse.setState( "suspended" );
      }
    }
    else if( eyecanMouse.roll > eyecanMouse.rollThreshold ) {
      //console.log( "command reset??" );   
      if( eyecanMouse.commandReset == false ) {
        eyecanMouse.commandReset = true; // can't issue command again until you stop doing it
        //console.log( "command reset" );   
        eyecanMouse.setConfigInitStatus( "animating" );
        eyecanMouse.setState( "initialising", 6000 );
      }
    }
    else { // cancel these actions, if pending
      if( eyecanMouse.state != "initialising" ) {
        //console.log( "cancel commands" );   
        eyecanMouse.commandReset = false;
        eyecanMouse.commandSuspend = false;
      }
    }
  },

  setup : function() {
  }

};

eyecanMouse.setup();


