
var eyecanContent = {

  // Restrictions, if >= PAGE_STATUS_PENDING, then allow access.
  PAGE_STATUS_NONE    : 0,
  PAGE_STATUS_NG      : 1,
  PAGE_STATUS_PENDING : 2,
  PAGE_STATUS_OK      : 3,
  pageToken : null,
  pageStatus : 0,
  PAGE_CHECK_TIMEOUT : 15000, // Grace period after firs access request. (increased because 2.5% seem to timeout)
  localhostDomains : [ "file", "127.0.0.1", "localhost", "0:0:0:0:0:0:0:1", "0:0:0:0:0:0:0:0", "::1" , "::" ], // http://en.wikipedia.org/wiki/IPv6_address

  // Status
  setupComplete : false,

  // Config
  config : null,
  prevConfig : null,
  lastMode : null,

  // Canvas
  canvasWasHidden : true,
  canvas : null,
  canvasContext : null,

  // Mouse movement logging
  xMouseScreen : 0, 
  yMouseScreen : 0,

  // Mouse press logging
  xMouseScreenDown : 0,
  yMouseScreenDown : 0,
  tMouseScreenDown : 0,
  bMouseDown : false,

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Keyboard Listener functions
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  addKeyboardListener : function() {
    window.addEventListener( "keydown", function(e) {
      eyecanContent.onKeyDown( e );
    }, false );
  }, 

  addMouseListeners : function() {
    window.addEventListener( "mousemove", function( e ) {
      eyecanContent.onMouseMove( e );
    }, false );

    window.addEventListener( "mousedown",function(e) {
      eyecanContent.onMouseDown( e );
    }, false );

    window.addEventListener( "mouseup",function(e) {
      eyecanContent.onMouseUp( e );
    }, false );
  }, 

  getMouseScreenX : function( mouseEvent ) {
      if( eyecanContent.config == null ) {
        return mouseEvent.screenX;
      }

      if( eyecanContent.getConfig( "browser.mouse.absScreenCoordinates" ) == "1" ) {
        return mouseEvent.screenX;
      }
      else {
        return mouseEvent.screenX + window.screenX;
      }
  },

  getMouseScreenY : function( mouseEvent ) {
      if( eyecanContent.config == null ) {
        return mouseEvent.screenY;
      }

      //if( eyecanContent.config.browser.mouse.absScreenCoordinates == 1 ) {
      if( eyecanContent.getConfig( "browser.mouse.absScreenCoordinates" ) == "1" ) {
        return mouseEvent.screenY;
      }
      else {
        return mouseEvent.screenY + window.screenY;
      }
  },

  onKeyDown : function( e ) {
    eyecanContent.sendKeyEventMessage( "down", e ); // not needed
  },

  setDocumentOffsetConfig : function( offsetX, offsetY ) {
    //console.log( "Changed document offset: (xOffset, yOffset): (" + offsetX + ", " + offsetY + ")" );
    eyecanContent.setConfig( "browser.document.offset.ready", "1" ); // TODO can this be done in background?
    eyecanContent.setConfig( "browser.document.offset.x", offsetX ); // TODO can this be done in background?
    eyecanContent.setConfig( "browser.document.offset.y", offsetY ); // TODO can this be done in background?
  },

  onMouseMove : function( e ) {
    // Save the current mouse position
    eyecanContent.xMouseScreen = eyecanContent.getMouseScreenX( e );
    eyecanContent.yMouseScreen = eyecanContent.getMouseScreenY( e );

    if( eyecanCoord.offset.x != null ) { // offset may not always be available

      var ready = eyecanContent.getConfig( "browser.document.offset.ready" );
      if( ready.localeCompare( "1" ) != 0 ) {
        eyecanContent.setDocumentOffsetConfig( eyecanCoord.offset.x, eyecanCoord.offset.y );
      }
      else {
        var x = parseInt( eyecanContent.getConfig( "browser.document.offset.x" ) );
        var y = parseInt( eyecanContent.getConfig( "browser.document.offset.y" ) );
        if(    x != eyecanCoord.offset.x
            || y != eyecanCoord.offset.y ) {
          eyecanContent.setDocumentOffsetConfig( eyecanCoord.offset.x, eyecanCoord.offset.y );
        }
      } 
    }

    // need to log this? Overkill?
    //eyecanContent.sendMouseEventMessage( "move", e );
  },

  onMouseDown : function( e ) {
    eyecanContent.bMouseDown = true;
    //eyecanContent.sendMouseEventMessage( "down", e );

    var xScreen = eyecanContent.getMouseScreenX( e );
    var yScreen = eyecanContent.getMouseScreenY( e );

    eyecanContent.xMouseScreenDown = xScreen;
    eyecanContent.yMouseScreenDown = yScreen;
    eyecanContent.tMouseScreenDown = eyecanUtil.getTimestamp();

    eyecanTruth.onMouseDown();
    eyecanLearning.onMouseDown();
  },

  onMouseUp : function( e ) {
    eyecanContent.bMouseDown = false;
    //eyecanContent.sendMouseEventMessage( "up", e );

    var clickTempEnabled = parseInt( eyecanContent.getConfig( "click.temp.enabled" ) );
    if( clickTempEnabled != 0 ) {
      var x  = eyecanContent.xMouseScreenDown;
      var y  = eyecanContent.yMouseScreenDown;
      var t1 = eyecanContent.tMouseScreenDown;
      var t2 = eyecanUtil.getTimestamp();
      var csv = eyecanTruth.getCsvIntervalScreen( t1, t2, x, y );
      eyecanContent.setConfig( "click.temp.append", csv );
    }

    eyecanTruth.onMouseUp();
    eyecanTraining.onMouseUp();
  },

  onWindowScroll : function( e ) {
    var scrollTempEnabled = parseInt( eyecanContent.getConfig( "scroll.temp.enabled" ) );
    if( scrollTempEnabled != 0 ) {
      var x  = window.pageXOffset;
      var y  = window.pageYOffset;
      var t = eyecanUtil.getTimestamp();
      var csv = t + "," + x + "," + y;
      //console.log( "Scroll: "+csv );
      eyecanContent.setConfig( "scroll.temp.append", csv );
    }
  },

//  sendMouseEventMessage : function( type, e ) {
//     var xScreen = eyecanContent.getMouseScreenX( e );
//     var yScreen = eyecanContent.getMouseScreenY( e );
//     var timestamp = eyecanUtil.getTimestamp()
// //    eyecanContent.setConfig( "browser.mouse.event."+type, { xScreen: xScreen, yScreen: yScreen, t: timestamp } );
//     eyecanContent.setConfig( "browser.mouse.event."+type+".xScreen", xScreen );
//     eyecanContent.setConfig( "browser.mouse.event."+type+".yScreen", yScreen );
//     eyecanContent.setConfig( "browser.mouse.event."+type+".t", timestamp );
//  },

  sendKeyEventMessage : function( type, e ) {
    var keyCode = e.keyCode;
    var timestamp = eyecanUtil.getTimestamp()
//    eyecanContent.setConfig( "browser.keyboard.event."+type, { keyCode: keyCode, t: timestamp } );
    eyecanContent.setConfig( "browser.keyboard.event."+type+".keyCode", keyCode );
    eyecanContent.setConfig( "browser.keyboard.event."+type+".t", timestamp );
  },

  performPageCheck : function( token, thirdPartyExtensionId ) {
    // console.log( "token" )
    // console.log( token )

    // Allow access as long as _one_ of the requests returned OK. Otherwise
    // if you have an extension that's now allowed on a valid domain, access
    // might be revoked.
    if( eyecanContent.pageStatus == eyecanContent.PAGE_STATUS_OK ) {
      return;
    }

    // Prevent user accidentally wanting page check.
    if( eyecanContent.pageToken && eyecanContent.pageToken == token ) {
      return;
    }

    eyecanContent.pageToken = token;

    // If this is the first time user requests permission then give them a grace period.
    // PAGE_STATUS_PENDING allows full access to extension.
    if( eyecanContent.pageStatus == eyecanContent.PAGE_STATUS_NONE ) {
      eyecanContent.pageStatus = eyecanContent.PAGE_STATUS_PENDING;
      
      // Give the grace period a time limit from first access request. If still
      // didn't get a valid response within this period, set it to disallow.
      // However, any valid response arriving after the grace period will immediately
      // reactivate. But there's only one grace period after the first access request.
      setTimeout( function() {
        if( eyecanContent.pageStatus != eyecanContent.PAGE_STATUS_OK ) {
          eyecanContent.pageStatus = eyecanContent.PAGE_STATUS_NG;
          console.error( "Grace period ended, disabling eyecan extension." )
        }
      }, eyecanContent.PAGE_CHECK_TIMEOUT )

    }

    eyecanContent.sendPageCheck( eyecanContent.pageToken, thirdPartyExtensionId );
  },

  checkOtherExtensions : eyecanUtil.callOnce( function() {
    // Check for multiple eyecan extensions.
    var numExtensions = 0;
    numExtensions += !!document.documentElement.getAttribute( 'data-eyecan-extension-version' );
    numExtensions += !!document.documentElement.getAttribute( 'data-eyesdecide-extension-version' );

    if( numExtensions > 1 ) {

      // Make sure only 1 extension shows the message.
      if( chrome.runtime.getManifest().short_name == "EyesDecide" ) {
        alert( "You have both eyecan and EyesDecide extensions installed. Please enable only one and refresh this page.");
      }

      window.removeEventListener( "message", eyecanContent.onPageMessage );

      //console.log( "onPageMessage() removed" )
      return;
    }
  }),

  onPageMessage : function( event ) {
    //  event {
    //    target : "eyecan",
    //    config {
    //      path : "xyz",
    //      value : "bob"
    //    }
    //  }
    //console.log( "eyecan ContentScript: message from page? " );
    if( event.source != window ) { // should come from this page and window
      //console.log( "event.source != window" );
      return;
    }

    // Message from embedding page?
    // AZ, Redundant?
    // if( event.data.target == null ) {
    //   return;
    // }

    if( event.data.target != "eyecan" ) {
      //console.log( 'event.data.target != "eyecan"' );
      return;
    }

    eyecanContent.checkOtherExtensions();

    // console.log( "event" );
    // console.log( event );

    if( event.data.action == "request-access" ) {
      // console.log( "eyecanContent: calling performPageCheck() on page event");
      eyecanContent.performPageCheck( event.data.token );
      return
    }

    if( eyecanContent.pageStatus == eyecanContent.PAGE_STATUS_NG ) {
      // marked as invalid, only recoverable with page reload.
      var eyecanEvent = document.createEvent( "CustomEvent" );
      eyecanEvent.initCustomEvent( "eyecanApiError", true, true, "forbidden" ); 
      document.dispatchEvent( eyecanEvent );

      return;
    }

    // remaining status values: OK, DEV, SENT (ie pending)
    //console.log( "eyecan ContentScript: target is eyecan, command accepted" );
    if( event.data.config != null ) {
      if( ( event.data.config.path != null ) && ( event.data.config.value != null ) ) {
        eyecanContent.setConfig( event.data.config.path, event.data.config.value );
      }
    }
  }, 

  isDeveloperPage : function() {
    // returns true of file:// or localhost
    if( window.location.protocol.indexOf( "file" ) >= 0 ) {
      return true;
    }

    var domain = document.domain;
    if( eyecanContent.checkDomainList( domain, eyecanContent.localhostDomains ) ) {
      return true;
    }

    return false;
  },

  sendPageCheck : function( token, thirdPartyExtensionId ) {
    // console.log( "content_script: sending page check" );
    // console.log( "thirdPartyExtensionId: " + thirdPartyExtensionId );

    // Replace domain with the extension ID if request is from extension.
    var domain = document.domain;
    if( thirdPartyExtensionId ) {
      domain = thirdPartyExtensionId;
    }

    // Settingd dev="1" will skip the domain check, which means if it'll reject
    // an authorised extension from accessing developer domains. Not good. So only
    // set dev="1" if there's an actual token. If no token, we set dev="0", and 
    // the URL filtering will take effect. Since dev URLs are not a part of the
    // white listed domains, they'll fail anyway.
    var dev = "0";
    if( token ) {
      if( eyecanContent.isDeveloperPage() ) {
        dev = "1";
      }
    }
    else {
      token = "null"
    }

    var t = eyecanUtil.getTimestamp();

    var server = "https://registration.eyecangaze.com";
    //var server = "https://localhost:8443";
    var parameters = "/auth?t="+t+"&dev="+dev+"&token="+token+"&domain="+domain+"&url="+document.URL;
    var url = server + parameters;
    //console.log( "XHR for eyecan compatible page: "+url );

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if( xhr.readyState == 4 ) {       
        if( xhr.status == 200 ) {
          eyecanContent.onPageCheck( xhr.responseText );
        }
        else {
          // How to handle can't communicate with central server ie offline?
          console.log( "eyecan HTTP request error: " + xhr.statusText );  
          eyecanContent.onPageNotAllowed( "Server could not be contacted." );
        }
      }
    };

    xhr.open( "GET", url, true );
    xhr.send();
  },

  // There's no need to set page status to PAGE_STATUS_NG. The grace period timer
  // does that.
  onPageNotAllowed : function( reason ) {
    var errorMessage = "eyecan API not authorised because: " + reason;
    console.error( errorMessage ); // for dev to read
    if( eyecanContent.pageStatus == eyecanContent.PAGE_STATUS_OK ) {
      console.error( "But we got an OK from an earlier request, so still allowing" ); // for dev to read      
    }
    // alert( errorMessage );
  },

  onPageCheck : function( result ) {
    // console.log( "Page check result: " + result );
    var resultObject = JSON.parse( result );
    if( resultObject.status == "ok" ) {
      // Set page status to PAGE_STATUS_OK whenever we get a valid response.
      eyecanContent.pageStatus = eyecanContent.PAGE_STATUS_OK;
    }
    else {
      eyecanContent.onPageNotAllowed( resultObject.reason );
    }

    // check the check isn't a reuse of a very old timestamp, while allowing some 
    if( resultObject.t ) {
      var t2 = eyecanUtil.getTimestamp();
      var t1 = resultObject.t;//new Date( resultObject.t ).getTime();
      var dt = t2 - t1;
      // console.log( "reply: t="+t1+" t2="+t2+" dt="+dt );
      if( dt > (90 * 1000.0) ) {
        eyecanContent.onPageNotAllowed( "Server didn't reply with a recent timestamp." );
      }
    }
    else {
      eyecanContent.onPageNotAllowed( "Server didn't reply with a timestamp." );
    }

    // Relay the challenge to the binary to check authenticity.
    // From server:         String result = time + dev + domain + token + sdk + status;
    var challenge = resultObject.t + resultObject.dev + resultObject.domain + resultObject.token + resultObject.sdk + resultObject.status + ":" + resultObject.challenge;
    eyecanContent.setConfig( "system.challenge", challenge );    
  },

  checkDomainList : function( domain, domainList ) {
    for( var i = 0; i < domainList.length; ++i ) { 
      if( eyecanContent.checkDomain( domain, domainList[ i ] ) ) {      
        //console.log( "Matched, allowing "+domain );
        return true;
      }
      //else {
        //console.log( "Not matched, not allowing "+domain );
      //}
    }

    return false;
  },

  checkDomain : function( domain, allowedDomain ) {
    // Basically I think endsWith will exhibit correct behaviour for all domains, while allowing subdomains correctly.
    // Should also work with localhost aliases.
    // http://stackoverflow.com/questions/280634/endswith-in-javascript
    //console.log( "checkDomain: "+domain+" : "+ allowedDomain );
    var check = ( domain.indexOf( allowedDomain, domain.length - allowedDomain.length ) !== -1 );
    //console.log( "checkDomain: result="+check );
    return check;
  },

  onBackgroundMessage : function( request, sender, sendResponse ) {
    // Not from extension
    if( sender.tab != null ) {
      return
    }

    // id our extension
    if( request.target != "eyecan" ) {
      //console.log( "eyecan ContentScript: message ?from background? doesn't contain eyecan origin." );
      return;
    }

    // what type of message did we send?
    if( request.type == "config" ) {
      //console.log( "eyecan ContentScript: Config message received from background." );
      eyecanContent.onConfig( request.content );
    }
    else if( request.type == "csv" ) {
      //console.log( "eyecan ContentScript: CSV message received from background." );
      eyecanContent.onCsv( request.content );
    }
    else if( request.type == "request-access" ) {
      // console.log( "eyecanContent: calling performPageCheck() on background message");
      eyecanContent.performPageCheck( request.content.token, request.content.extensionId );
    }
  },

  onCsv : function( csv ) {
    //console.log( "CSV : "+JSON.stringify( csv ) );
    //console.log( "Page requested CSV content of "+ csv.path +" into element with ID: "+csv.id );

    // Not authorised
    if( eyecanContent.pageStatus < eyecanContent.PAGE_STATUS_PENDING ) {
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if( xhr.readyState == 4 && xhr.status == 200 ) {
        var element = document.getElementById( csv.id );
        if( !!element ) {
          element.innerHTML = xhr.responseText;

          // relay to the page:
          var eyecanEvent = document.createEvent( "CustomEvent" );
          eyecanEvent.initCustomEvent( "eyecanApiIdPath", true, true, csv ); 
          document.dispatchEvent( eyecanEvent );
        }
        else {
          throw( "Page requested CSV content of "+ csv.file +" into element with ID: "+csv.id+" but that element doesn't exist." );
        }
      }
    };    
    xhr.open( "GET", csv.url, true );
    xhr.send();
  },

  sendConfigMessage : function( path, value ) {
    //  payload {
    //    target : "eyecan",
    //    config {
    //      path : "xyz",
    //      value : "bob"
    //    }
    //  }
    //chrome.runtime.sendMessage( { target: "eyecan", config: { path: path, value: value } }, function( response ) {} );
    var m = { target: "eyecan", config: { path: path, value: value } };
    eyecanContent.postBackgroundMessage( m );
  },

  sendActionMessage : function( action ) {
    //  payload {
    //    target : "eyecan",
    //    action : "some-action"
    //  }
    //chrome.runtime.sendMessage( { target: "eyecan", action: action }, function( response ) {} );
    var m = { target: "eyecan", action: action };
    eyecanContent.postBackgroundMessage( m );
  },

  postBackgroundMessage : function( m ) {
    chrome.runtime.sendMessage( m );
//    eyecanContent.openBackgroundMessage();
//    eyecanContent.port.postMessage( m );
  },

  getConfigImpl : function( config, path ) {
    try {
      //return eyecanContent.config[ path ];
      if( config == null ) { 
        //console.log( "eyecan ContentScript: Config is null." );
        return "";
      }

      var value = eyecanUtil.getObjectProperty( config, path );

      if( typeof value != 'undefined' ) {
        return value;
      }
      console.log( "eyecan ContentScript: undefined config path: "+path );
      return "";
    }
    catch( err ) {
      console.log( "eyecan ContentScript: error accessing config path: "+path );
      return "";
    }
  },

  getConfig : function( path ) {
    return eyecanContent.getConfigImpl( eyecanContent.config, path );
  },

  getPrevConfig : function( path ) {
    return eyecanContent.getConfigImpl( eyecanContent.prevConfig, path );
  },

  requestConfigUpdate : function( path, value ) {
    // set all the paths in this config to the specified values
    //console.log( "eyecan ContentScript: setConfig path: "+ path + " value: " + JSON.stringify( value ) );
    eyecanContent.sendActionMessage( "request-config-update" );
  },

  setConfig : function( path, value ) {
    // set all the paths in this config to the specified values
    //console.log( "eyecan ContentScript: setConfig path: "+ path + " value: " + JSON.stringify( value ) );
    eyecanContent.sendConfigMessage( path, value );        
  },

  onConfig : function( config ) {
    // cache the state for display
    eyecanContent.prevConfig = eyecanContent.config;
    eyecanContent.config = config;

    // check for properties we care about:
    var captureMouse = parseInt( eyecanContent.getConfig( "browser.canvas.captureMouse" ) );
    if( captureMouse != 0 ) {  // which sign is the new value
      eyecanContent.setCanvasCaptureMouse( true );  // only on change
    } 
    else {
      eyecanContent.setCanvasCaptureMouse( false );
    }

    // truth update
    eyecanTruth.onConfig();
    eyecanCalib.onConfig();
    eyecanErrors.update();

    // preview automation
    var previewEnabled = parseInt( eyecanContent.getConfig( "frame.stream.preview" ) );
    eyecanPreview.setEnabled( previewEnabled );

    // hide/show canvas when config changed? (No: done on paint updates)

    // Not authorised
    if( eyecanContent.pageStatus < eyecanContent.PAGE_STATUS_PENDING ) {
      return;
    }

    // relay to the page:
    var eyecanEvent = document.createEvent( "CustomEvent" );
    eyecanEvent.initCustomEvent( "eyecanApiState", true, true, config ); 
    document.dispatchEvent( eyecanEvent );
  },

  configChanged : function( path ) {
    var curr = eyecanContent.getConfig    ( path );
    var prev = eyecanContent.getPrevConfig( path );
    return ( curr != prev );
  },

  addPageMessageListener : function() {
    window.addEventListener( "message", eyecanContent.onPageMessage, false );
  },

  addBackgroundMessageListener : function() {
    chrome.runtime.onMessage.addListener( eyecanContent.onBackgroundMessage );
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // CSS Mouse Helper functions
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  setCanvasCaptureMouse : function( captureMouse ) {
    if( captureMouse ) {
      eyecanContent.addClass( eyecanContent.canvas, 'allow-pointer' );
    }
    else {
      eyecanContent.removeClass( eyecanContent.canvas, 'allow-pointer' );
    }
  },

  hasClass : function( element, elementClass ) {
    return element.className.match(new RegExp('(\\s|^)'+elementClass+'(\\s|$)'));
  },

  addClass : function( element, elementClass ) {
    if( !eyecanContent.hasClass( element, elementClass ) ) {
      element.className += " "+elementClass;
    }
  },

  removeClass : function( element, elementClass ) {
    if( eyecanContent.hasClass( element,elementClass ) ) {
      var reg = new RegExp('(\\s|^)'+elementClass+'(\\s|$)');
      element.className = element.className.replace( reg, ' ' );
    }
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Canvas functions
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  getCanvasCoordinatesMouseDown : function() {
    return eyecanContent.getCanvasCoordinates( eyecanContent.xMouseScreenDown, eyecanContent.yMouseScreenDown );
  },

  getCanvasCoordinatesMouse : function() {
    return eyecanContent.getCanvasCoordinates( eyecanContent.xMouseScreen, eyecanContent.yMouseScreen );
  },

  getCanvasCoordinates : function( xScreen, yScreen ) {

    var xOffset = eyecanCoord.offset.x;
    var yOffset = eyecanCoord.offset.y;

    var xWindow = window.screenX;
    var yWindow = window.screenY;

    var x = xScreen -xOffset -xWindow;
    var y = yScreen -yOffset -yWindow;

    // Error check
    // var xOffset2 = parseInt( eyecanContent.getConfig( "browser.document.offset.x" ) );
    // var yOffset2 = parseInt( eyecanContent.getConfig( "browser.document.offset.y" ) );
    // if(    xOffset2 != xOffset
    //     || yOffset2 != yOffset ) {
    //   console.log( "offset from local:  " + xOffset  + ", " + yOffset  );
    //   console.log( "offset from config: " + xOffset2 + ", " + yOffset2 );
    // }

    return { x: x, y: y };
  },

  resizeCanvas : function() {
      //console.log( "Resizing overlay canvas" );
      //console.log( "eyecanCoord.devicePixelRatio(): " + eyecanCoord.devicePixelRatio() );
      if( !eyecanCoord.devicePixelRatio() ) {
      	//console.error( "eyecanCoord.devicePixelRatio() is not valid yet" );
      	return;
      }
      //console.log( "devicePixelRatio: " + devicePixelRatio );
//       if( !eyecanCoord.devicePixelRatio() ) {
//       	setTimeout( eyecanCoord.resizeCanvas, 100 );
//       	return;
//       }
      eyecanContent.canvas.width  = (window.innerWidth +0) * eyecanCoord.devicePixelRatio();
      eyecanContent.canvas.height = (window.innerHeight+0) * eyecanCoord.devicePixelRatio();
      eyecanContent.canvas.style.width  = window.innerWidth +0 + "px";
      eyecanContent.canvas.style.height = window.innerHeight+0 + "px";
  },

  paintCanvas : function() {
    eyecanContent.setCanvasTimeout(); // schedule next repaint

    if( document.webkitHidden ) {
      eyecanContent.canvasWasHidden = true;
      //console.log( "eyecan ContentScript: not painting as not visible" );
      eyecanContent.hideCanvas();
      return;
    }

    if( eyecanContent.canvasWasHidden ) {
      eyecanContent.canvasWasHidden = false;
      eyecanContent.requestConfigUpdate();
    }

    // console.log( "eyecan ContentScript: repaint canvas" );
    // check the mode
    // delegate painting to relevant mode:
    // off: nothing - set hide canvas to true
    // mouse: nothing - set hide canvas to true
    // learning: show passive UI, show canvas.
    // training: delegate painting to UI.

    var mode = eyecanContent.getConfig( "system.mode" );

    // Clear the canvas since we may show the canvas to capture mouse but without
    // painting on it, in which case the canvas might has left over from previous
    // mode.
    if( eyecanContent.lastMode != mode ) {
      eyecanContent.lastMode = mode;
      eyecanContent.canvasContext.clearRect( 0,0, eyecanContent.canvas.width, eyecanContent.canvas.height );
    }

    if( mode == "off" ) { 
      eyecanContent.hideCanvas();
    } 
    else if( mode == "head" ) {
      if( eyecanHead.paintHeadPose() ) {
        eyecanContent.showCanvas();
        eyecanHead.paint();
      }
      else {
        eyecanContent.hideCanvas();
      }
    }
    else if( mode == "mouse" ) {
      eyecanContent.showCanvas();
      eyecanMouse.paint();
    }
    else if( mode == "learning" ) {
      eyecanContent.showCanvas(); // still need to show the canvas to capture mouse
      if( eyecanLearning.paintLearning() ) {
        eyecanLearning.paint();
      }
    }
    else if( mode == "training" ) {
      //eyecanContent.showCanvas();
      //eyecanTraining.paint();
      eyecanContent.hideCanvas(); // we don't paint anything, so dont show the canvas
    }
  },

  showCanvas : function() {
    if( eyecanContent.canvas.style.display != "block" ) {
      eyecanContent.canvas.style.display = "block";
    }
  },
  hideCanvas : function() {
    if( eyecanContent.canvas.style.display != "none" ) {
      eyecanContent.canvas.style.display = "none";
    }
  },
  addCanvas : function() {
    // canvas element (usually invisible graphical overlay)
    eyecanContent.canvas = document.createElement( 'canvas' );
    eyecanContent.canvas.setAttribute( "id", "eyecanCanvas" );
    eyecanContent.canvas.setAttribute( "width",  screen.width  );//window.innerWidth);
    eyecanContent.canvas.setAttribute( "height", screen.height );//window.innerHeight);
    // eyecanContent.canvas.setAttribute( "style", "background:0" );
    eyecanContent.canvas.setAttribute( "style", "background:0; display:none;" );
    eyecanContent.canvasContext = eyecanContent.canvas.getContext( "2d" );

    // add these UI tools to the document:	
    var style = document.createElement( 'style' ), // style - positions the canvas element and makes it 'click throughable' 
    rules = document.createTextNode('#eyecanCanvas{pointer-events:none;top:0;left:0;position:fixed;z-index:2147483646;}#eyecanCanvas.allow-pointer{pointer-events:auto;}');
    style.type = 'text/css';

    if( style.styleSheet ) {
      style.styleSheet.cssText = rules.nodeValue;
    }
    else {
      style.appendChild( rules );
    }

    var head = document.getElementsByTagName( 'head' )[0];
    head.appendChild( style );
    document.getElementsByTagName('body')[ 0 ].appendChild( eyecanContent.canvas );

    // add a painting callback for the canvas:
    eyecanContent.setCanvasTimeout();

    window.addEventListener('resize', eyecanContent.resizeCanvas );

    eyecanContent.resizeCanvas(); // first time
  },

  setCanvasTimeout : function() {
    var interval = 500; // slow
    if( eyecanContent.config != null ) {
      if( !document.webkitHidden ) {
        //interval = eyecanContent.config.browser.canvas.intervalFocus;
        interval = eyecanContent.getConfig( "browser.canvas.intervalFocus" );
      }
      else {
        //interval = eyecanContent.config.browser.canvas.intervalBlur;
        interval = eyecanContent.getConfig( "browser.canvas.intervalBlur" );
      }    
    }

    //console.log( "eyecan ContentScript: set timeout: "+ interval );
    setTimeout( eyecanContent.paintCanvas, interval );
  },

/*  removePreview : function() {
    var v = document.getElementById( "eyecanPreview" );
    if( v ) {
      v.src = null;
    }  
  },

  addPreview : function() {
    if( document.getElementById( "eyecanPreview" ) ) {
      var width  = eyecanContent.getConfig( "frame.stream.width"  );
      var height = eyecanContent.getConfig( "frame.stream.height" );

      if( width && height ) {
        eyecanPreview.openCamera( parseInt(width), parseInt(height) );
      }
      else {
        console.log( "Invalid video size" );
      }
    }
  },*/

  setupCoords : function() {
    // Wait for the device pixel ratio to be ready, otherwise we can't initialise the canvas properly.
    var ratioWithoutZoom = parseFloat( eyecanContent.getConfig( "browser.screen.devicePixelRatioWithoutZoom" ) );
    if(    !ratioWithoutZoom
        ||  ratioWithoutZoom == 0 ) {
      //console.log( "waiting for browser.screen.devicePixelRatioWithoutZoom" );
      setTimeout( eyecanContent.setupCoords, 100 );
      return;
    }
    eyecanCoord.setup( ratioWithoutZoom );
    eyecanContent.resizeCanvas();
  },
  
  setup : function() {
    // only setup() once
    //console.log( "eyecan ContentScript: setup..." );
    if( eyecanContent.setupComplete == true ) {
      return;
    }
    eyecanContent.setupComplete = true;

    //eyecanContent.addKeyboardListener();    
    eyecanContent.addMouseListeners();    
    eyecanContent.addPageMessageListener();    
    eyecanContent.addBackgroundMessageListener();    
    eyecanContent.addCanvas();    
    eyecanContent.setupCoords();

    // Scroll handler to toggle classes.
    window.addEventListener( "scroll", eyecanContent.onWindowScroll, false );
  }

}

eyecanContent.setup();

// Adds an invisible div that indictates the eyecan extension is ready.
document.documentElement.setAttribute( 'data-eyecan-extension-ready', 1 );

var eyecanEvent = new CustomEvent( "eyecanApiReady" );
document.dispatchEvent( eyecanEvent );

