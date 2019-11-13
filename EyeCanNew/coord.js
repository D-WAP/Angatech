
eyecanCoord = {

    // Variables
    // ----------------------------------------------------------------
    prevMouse : {
        screen : {
            x : null,
            y : null
        },
        client : {
            x : null,
            y : null }
        },

    devicePixelRatio : null,
    lockoutCountDown : 0,
    offsetUpdateCnt : 0,
    failSafeResetCnt : 0,
    
    offset : { 
        x : null,
        y : null
    },

    offsetRange : null,

    mouseScreenX : null,
    mouseScreenY : null,
    
    //onDevicePixelRatioChange : function () {}, // reassign to do somthing


    // Functions
    // ----------------------------------------------------------------
    setup : function( devicePixelRatioWithoutZoom ) {
      if( devicePixelRatioWithoutZoom == 0 ) {
        console.error( "devicePixelRatioWithoutZoom is zero" );
        return;
      }

      eyecanCoord.devicePixelRatioWithoutZoom = devicePixelRatioWithoutZoom;
      //console.log( "default zoom: " + eyecanCoord.devicePixelRatioWithoutZoom );
      offsetRange = eyecanCoord.resetOffsetRange();
      window.addEventListener( "mousemove", eyecanCoord.onMouseMove );
      window.addEventListener( "resize", function() { eyecanCoord.reset(); } );
        
      if( eyecanContent.getConfig( "browser.mouse.absScreenCoordinates" ) == "1" ) {
        eyecanCoord.mouseScreenX = function(mouseEvent) { return mouseEvent.screenX; }
        eyecanCoord.mouseScreenY = function(mouseEvent) { return mouseEvent.screenY; }
      }
      else {
        eyecanCoord.mouseScreenX = function(mouseEvent) { return mouseEvent.screenX + window.screenX; } // This is only needed in chrome because of a bug
        eyecanCoord.mouseScreenY = function(mouseEvent) { return mouseEvent.screenY + window.screenY; }
      }
        
      eyecanCoord.reset();
//         console.log( "eyecancoord Setup done" );
    },
    
    resetOffsetRange : function() {
        return {
            x : {
                min:  Infinity,
                max: -Infinity
            },
            y : {
                min:  Infinity,
                max: -Infinity
            }
        };
    },
    
    devicePixelRatio : function() {
    	if( !eyecanCoord.devicePixelRatioWithoutZoom ) {
    		return null;
    	}
    	return window.devicePixelRatio / eyecanCoord.devicePixelRatioWithoutZoom;
	},
	
    reset : function() {
//     	console.log( "Resetting" );
        eyecanCoord.offsetRange = eyecanCoord.resetOffsetRange();
        eyecanCoord.prevDevicePixelRatio = eyecanCoord.devicePixelRatio();
        //eyecanCoord.onDevicePixelRatioChange();
    },

    updateRange : function( range, x, y ) {
        range.x.min = Math.min( range.x.min, x );
        range.x.max = Math.max( range.x.max, x );
        range.y.min = Math.min( range.y.min, y );
        range.y.max = Math.max( range.y.max, y );
    },


    offsetFromRange : function( range ) {
        return {
            x: Math.round( (range.x.min + range.x.max) / 2 ),
            y: Math.round( (range.y.min + range.y.max) / 2 )
        };
    },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Coordinate conversion
  // Dave 2 Alan: These are converted from old extension, aren't tested as compatible with the rest
  // of this coord utility...
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  scr2docX: function( screenX ) {
    var ready = eyecanContent.getConfig( "browser.document.offset.ready" );
    if( ready.localeCompare( "1" ) != 0 ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }

    var xOffset = eyecanContent.getConfig( "browser.document.offset.x" );
    return screenX - window.screenX - xOffset;
  },

  scr2docY: function( screenY ) {
    var ready = eyecanContent.getConfig( "browser.document.offset.ready" );
    if( ready.localeCompare( "1" ) != 0 ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }

    var yOffset = eyecanContent.getConfig( "browser.document.offset.y" );
    return screenY - window.screenY - yOffset;
  },

  scr2doc: function( screenX, screenY ) {
    return {
      x: eyecanCoord.scr2docX( screenX ),
      y: eyecanCoord.scr2docY( screenY )
    }
  },

  doc2scrX: function( documentX ) {
    var ready = eyecanContent.getConfig( "browser.document.offset.ready" );
    if( ready.localeCompare( "1" ) == 0 ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }
    var xOffset = eyecanContent.getConfig( "browser.document.offset.x" );
    return documentX + window.screenX + xOffset;
  },

  doc2scrY: function( documentY ) {
    var ready = eyecanContent.getConfig( "browser.document.offset.ready" );
    if( ready.localeCompare( "1" ) == 0 ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }
    var yOffset = eyecanContent.getConfig( "browser.document.offset.y" );
    return documentY + window.screenY + yOffset;
  },

  doc2scr: function( documentX, documentY ) {
    return {
      x: eyecanCoord.doc2scrX( documentX ),
      y: eyecanCoord.doc2scrY( documentY )
    }
  },

    onMouseMove : function( e ) {
//     	console.log( "e.screenXY: " + e.screenX + ", " + e.screenY );
//     	console.log( "window.innerWH: " + window.innerWidth + ", " + window.innerHeight );
//     	console.log( "window.devicePixelRatio: " + window.devicePixelRatio );
//     	console.log( "eyecanCoord.devicePixelRatio: " + eyecanCoord.devicePixelRatio() );
    
        // console.log( window.devicePixelRatio );
        if( eyecanCoord.prevDevicePixelRatio != eyecanCoord.devicePixelRatio() ) {
            eyecanCoord.reset();
        }

        // on move, compute the otherwise inaccessible document-offset property
        var mouseScreenX = eyecanCoord.mouseScreenX( e );
        var mouseScreenY = eyecanCoord.mouseScreenY( e );

        // First time
        if( eyecanCoord.prevMouse.screen.x === null ) {
            eyecanCoord.prevMouse.screen.x = mouseScreenX;
            eyecanCoord.prevMouse.screen.y = mouseScreenY;
            eyecanCoord.prevMouse.client.x = e.clientX;
            eyecanCoord.prevMouse.client.y = e.clientY;
        }

        // Didn't move?
        if(    eyecanCoord.prevMouse.screen.x - mouseScreenX == 0
            && eyecanCoord.prevMouse.screen.y - mouseScreenY == 0 ) {
            return;
        }

        // See if what's observed matched with the devicePixelRatio
        var screenDeltaX = ( mouseScreenX - eyecanCoord.prevMouse.screen.x );
        var screenDeltaY = ( mouseScreenY - eyecanCoord.prevMouse.screen.y );
        var clientDeltaX = (    e.clientX - eyecanCoord.prevMouse.client.x );
        var clientDeltaY = (    e.clientY - eyecanCoord.prevMouse.client.y );

        // Save current
        eyecanCoord.prevMouse.screen.x = mouseScreenX;
        eyecanCoord.prevMouse.screen.y = mouseScreenY;
        eyecanCoord.prevMouse.client.x = e.clientX;
        eyecanCoord.prevMouse.client.y = e.clientY;

        if( eyecanCoord.lockoutCountDown > 0 ) {
            eyecanCoord.lockoutCountDown--;
            return;
        }

        var dx = Math.abs( screenDeltaX / eyecanCoord.devicePixelRatio() - clientDeltaX );
        var dy = Math.abs( screenDeltaY / eyecanCoord.devicePixelRatio() - clientDeltaY );

        // console.log( "screenDeltaXY: (" + screenDeltaX + ", " + screenDeltaY + ")" );
        // console.log( "clientDeltaXY: (" + clientDeltaX + ", " + clientDeltaY + ")" );
        // console.log( "dXY: (" + dx + ", " + dy + ")" );
        if( dx > 1 || dy > 1 ) {
            // console.log( "Bad coordinates" );
            eyecanCoord.lockoutCountDown = 5; // lock out the next few
            return;
        }

        // Make sure document offset is up to date
        var newOffsetX = mouseScreenX - window.screenX - e.clientX * eyecanCoord.devicePixelRatio();
        var newOffsetY = mouseScreenY - window.screenY - e.clientY * eyecanCoord.devicePixelRatio();

        eyecanCoord.updateRange( eyecanCoord.offsetRange, newOffsetX, newOffsetY );

        // Fail safe
        var tolerance = 1.1;

        var rangeX = eyecanCoord.offsetRange.x.max - eyecanCoord.offsetRange.x.min;
        var rangeY = eyecanCoord.offsetRange.y.max - eyecanCoord.offsetRange.y.min;
        // console.log( "rangeXY: " + rangeX + ", " + rangeY );
        // console.log( "window.devicePixelRatio: " + window.devicePixelRatio );
        if(    rangeX > eyecanCoord.devicePixelRatio() * tolerance
            || rangeY > eyecanCoord.devicePixelRatio() * tolerance ) { // leave some room for rounding errors
            
            //console.error( "fail safe reset" );
            eyecanCoord.failSafeResetCnt++;
            eyecanCoord.reset();
            return;
        }

        var newOffset = eyecanCoord.offsetFromRange( eyecanCoord.offsetRange );

        // console.log( "old xy="+eyecanCoord.offset.x+","+eyecanCoord.offset.y+" new xy="+newOffset.x+","+newOffset.y );
        if(    eyecanCoord.offset.x != newOffset.x
            || eyecanCoord.offset.y != newOffset.y ) {

            eyecanCoord.offsetUpdateCnt++;
            eyecanCoord.offset = newOffset;
        }

        // console.log( "offset: (" + eyecanCoord.offset.x + ", " + eyecanCoord.offset.y + ")" );
        // console.log( "offsetUpdateCnt: " + eyecanCoord.offsetUpdateCnt );
        // console.log( "failSafeResetCnt: " + eyecanCoord.failSafeResetCnt );
    },
};
