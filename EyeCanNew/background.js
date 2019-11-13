///////////////////////////////////////////////////////////////////////////////
// start Mixpanel
///////////////////////////////////////////////////////////////////////////////
(function(e,b){if(!b.__SV){var a,f,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=e.createElement("script");a.type="text/javascript";a.async=!0;a.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"/cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?chrome.extension.getURL("mixpanel-2-latest.min.js"):chrome.extension.getURL("mixpanel-2-latest.min.js");f=e.getElementsByTagName("script")[0];f.parentNode.insertBefore(a,f)}})(document,window.mixpanel||[]);
mixpanel.init("05cb9fbf6dc0de82329b3c51c5f8ec3d");

eyecanUtil.getUserInfo( function(userInfo) {
  mixpanel.identify( userInfo.userId );
  console.log( "mixpanel: Setting user id: " + userInfo.userId );

  mixpanel.people.set({
    "$created": new Date(userInfo.installDate),
    "$last_login": new Date(),
  });
  console.log( "mixpanel: Setting user info" );
})
///////////////////////////////////////////////////////////////////////////////
// end Mixpanel
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Google analytics
///////////////////////////////////////////////////////////////////////////////

var _gaq = _gaq || [];
_gaq.push(['_setAccount', eyecanVariables.GA_ID]);

function loadGa() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  //ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);

  // window.alert("google-analytics loaded");
}

setTimeout(loadGa, 0);

///////////////////////////////////////////////////////////////////////////////
// end Google analytics
///////////////////////////////////////////////////////////////////////////////

var eyecanBackground = {

  filesSent : 0,
  filesTotal : 0,
  fileCallbacks : 0,
  config : null,
  realtimeModule : null,
  previewImgArrayBuf : null,
  persistentFs: null,
  extensionLoadTime: new Date(),

  setBrowserConfig : function() {

    // Detect OS and choose document offset mode
    var mouseAbsScreenCoordinates = 1;
    if( window.navigator.platform.search(/linux/i) >= 0 ) {
      var chromeVersion = parseInt( window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10 );

      if (!eyecanBackground.setBrowserConfig.timer) {
        console.log( "Info: Linux OS detected, Chrome v" +chromeVersion );
      }

      if( chromeVersion < 42 ) {
        mouseAbsScreenCoordinates = 0;
      }
    }
    else {
      if (!eyecanBackground.setBrowserConfig.timer) {
        console.log( "Info: Non-Linux OS detected." );
      }
    }

    var dpi = eyecanUtil.getDpi();

    eyecanBackground.setConfig( "browser.mouse.absScreenCoordinates", mouseAbsScreenCoordinates );
    eyecanBackground.setConfig( "browser.screen.width", screen.width );
    eyecanBackground.setConfig( "browser.screen.height", screen.height );
    eyecanBackground.setConfig( "browser.screen.dpi", dpi );
    eyecanBackground.setConfig( "browser.screen.devicePixelRatioWithoutZoom", window.devicePixelRatio );
    if (!eyecanBackground.setBrowserConfig.timer) {
      console.log( "window.devicePixelValue of background page: " +  window.devicePixelRatio );
    }

    // Start the refresh timer.
    // if (!eyecanBackground.setBrowserConfig.timer) {
    //   eyecanBackground.setBrowserConfig.timer = setInterval( function() {
    //     eyecanBackground.setBrowserConfig();
    //   }, 2000);
    // }
  },

  getConfig : function( path ) {
    // returns a string, empty if path not valid
    try {
      var value = eyecanUtil.getObjectProperty( eyecanBackground.config, path );
      return value;
    }
    catch( err ) {
      console.log( "eyecan ContentScript: error accessing config path: "+path );
      return "";
    }
  },

  setConfigImpl : function( pathValue, valueValue, persistent ) {
    // TODO filter, validate?
    if( ( typeof valueValue == 'string' ) || ( valueValue instanceof String ) ) {
    }
    else {
      valueValue = JSON.stringify( valueValue );
    }
    // console.log( "Info: Set config " + pathValue + " = " + valueValue );
    var msg = { type: "config", path: pathValue, value: valueValue };
    if( persistent ) {
      msg.persistent = "1";
    }
    eyecanBackground.postMessage( msg );
  },


  setConfig : function( pathValue, valueValue ) {
    eyecanBackground.setConfigImpl( pathValue, valueValue, false );
  },

  setPersistentConfig : function( pathValue, valueValue ) {
    eyecanBackground.setConfigImpl( pathValue, valueValue, true );
  },

  setCallback : function( value ) {
    console.log( "Info: Set callback: "+ value );
    eyecanBackground.postMessage( { type: "callback", callback: value } );
  },

  sendConfigContentScriptMessage : function( config ) {
    eyecanBackground.sendContentScriptMessage( "config", config );
  },
  sendCsvContentScriptMessage : function( csv ) {
    eyecanBackground.sendContentScriptMessage( "csv", csv );
  },

  sendContentScriptMessage : function( type, content, tabId ) {
    // sends a message to the content script in active current tab only
    var m = { target: 'eyecan', type: type, content: content };
    if( tabId ) {
      chrome.tabs.sendMessage( tabId, m );
    }
    else {
      // NOTE: When you open the html page of the background.js, it becomes the
      // current window and there are no tabs in this window, just the js console.
      // So we need to handle the case where there are no tabs.
      chrome.tabs.query( { active: true, currentWindow: true }, function( tabs ) {
        if( tabs.length > 0 ) {
          chrome.tabs.sendMessage( tabs[ 0 ].id, m );
        }
      });
    }
  },

  postMessage : function( payload ) {
    if( eyecanBackground.realtimeModule != null ) {
      //console.log( "PostMessage: " + JSON.stringify( payload ) );
      eyecanBackground.realtimeModule.postMessage( payload );
    }
    else {
      console.log( "Error: Module is null during postMessage(), pay load:" );
      console.log( payload );
    }
  },
 
  onModuleLoad : function() {
    eyecanBackground.realtimeModule = document.getElementById( "realtime" );

    if( eyecanBackground.realtimeModule == null ) {
        alert( "Error: eyecan Native Code module didn't load." );
    }
    else {
        // alert( "Module loaded.");
    }

    eyecanBackground.realtimeModule.addEventListener( 'message', eyecanBackground.onModuleMessage, false );

    // download all the data files to the nacl binary
    eyecanBackground.filesTotal = 0;
    ++eyecanBackground.filesTotal; eyecanBackground.postDataFile( "/data/default.config.json" );
    ++eyecanBackground.filesTotal; eyecanBackground.postDataFile( "/data/haarcascade_frontalface_alt2.xml" );
    ++eyecanBackground.filesTotal; eyecanBackground.postDataFile( "/data/lbpcascade_frontalface.xml" );
    ++eyecanBackground.filesTotal; eyecanBackground.postDataFile( "/data/training_data.linear_svm_model" );
    ++eyecanBackground.filesTotal; eyecanBackground.postDataFile( "/data/training_data.range" );
    ++eyecanBackground.filesTotal; eyecanBackground.postDataFile( "/data/step_reduce_terms.txt" );

    // set config relating to the page:
    // eyecanBackground.setBrowserConfig(); deferred

    // start the app:
    //eyecanBackground.setConfig( "process.ready", "1" );      
    //eyecanBackground.onModuleStart();  start deferred until process.ready
  },

  onExtensionMessage : function( request, sender, sendResponse ) {
    //  event {
    //    target : "eyecan",
    //    config {
    //      path : "xyz",
    //      value : "bob"
    //    }
    //  }
    //console.log( "Background: Message " + ( sender.tab ? "from a content script:" + sender.tab.url : "from the extension" ) );

    if( request.target == null ) {
      return;
    }

    if( request.target != "eyecan" ) {
      return;
    }

    //console.log( "Background: Message has eyecan target." );
    if( request.config != null ) {
      //console.log( "Background: Message has config." );
      if( ( request.config.path != null ) && ( request.config.value != null ) ) {
        //console.log( "Background: Message set config path-value." );
        eyecanBackground.setConfig( request.config.path, request.config.value );
      }
    }
    else if( request.action ) {
      if( request.action == "request-config-update" ) {
        eyecanBackground.sendConfigContentScriptMessage( eyecanBackground.config );
      }
      else {
        console.error( "onExtensionMessage(): invalid request.action: " + request.action );
      }
    }
    else if( request.analytics ) {
      eyecanBackground.sendAnalytics( request.analytics.event, request.analytics.action )
    }
  },

  onModuleStop : function() {
    console.log( "Background: stop" );
    // TODO alan
  },

  onModuleStart : function() {
    console.log( "Background: start" );
    eyecanBackground.postMessage( { type: "setup" } );
  },

  onModuleMessage : function( e ) {
    //console.log( "Background: Message received from module." );
    //console.log( "data: " + e.data );
    if( e.data.config != null ) {
      eyecanBackground.onModuleConfig( e.data.config );
      // don't return, ie DO broadcast.
    }

    if( e.data.callback != null ) {
      eyecanBackground.onModuleCallback( e.data.callback );
      return; // don't broadcast
    }

    if( e.data.type != null ) {
      if( e.data.type == "frame" ) {
        //console.log( "Background: bytes="+e.data.imageData.byteLength );
        eyecanBackground.onModuleFrame( e.data );
      }
      else if( e.data.type == "csv" ) {
        eyecanBackground.onModuleCSV( e.data );
      }
      else if( e.data.type == "reloadExtension" ) {
        eyecanBackground.reloadExtension();
      }
//      else if( e.data.type == "stream" ) {
//        eyecanBackground.onModuleStream( e.data );
//      }
    }

    // Relay the message to the rest of the extension (ie the options page if present):   [what about content scripts?]
    chrome.runtime.sendMessage( chrome.runtime.id, e.data );
  },

  onModuleCallback : function( valueString ) {
    console.log( "Background: callback with "+valueString );
    if( valueString == "file" ) {
      // start the app:
      eyecanBackground.fileCallbacks = eyecanBackground.fileCallbacks +1;

      console.log( "Background: have "+eyecanBackground.fileCallbacks+" of "+eyecanBackground.filesTotal+" callbacks" );
      if( eyecanBackground.fileCallbacks == eyecanBackground.filesTotal ) {
        eyecanBackground.onModuleStart();
        eyecanBackground.setCallback( "setup" );
      }
    }
    else if( valueString == "setup" ) {
      eyecanBackground.setBrowserConfig();
    }
  },

  onModuleConfig : function( configString ) {
    // console.log( "onModuleConfig() called" );

    var config = JSON.parse( configString );
   
    eyecanBackground.config = config;
    eyecanBackground.handleConfigChanges();
    //console.log( "config="+eyecanBackground.config);
    eyecanBackground.sendConfigContentScriptMessage( eyecanBackground.config );
  },

  onModuleCSV : function( data ) {
    // http://stackoverflow.com/questions/17103398/convert-javascript-variable-value-to-csv-file
    //console.log( "Background: got CSV from "+data.path+" destined for id="+data.id+" bytes="+data.csv.byteLength );
    //console.log( "Background: got CSV from "+JSON.stringify( data ) );

    var blob = new Blob( [ data.csv ], { type: 'text/csv' } );
    var url = URL.createObjectURL( blob ); // TODO apparently these don't get cleaned up enthusiastically without an explicit release, so TODO delete it
    var csv = {
      url: url,
      path: data.path,
      id: data.id
    };

    eyecanBackground.sendCsvContentScriptMessage( csv );
  },

  onModuleFrame : function( frame ) {
      // Sending events to the options pages seems to remove the object type of
      // frame.imageData, which should be an ArrayBuffer.
      // So the work around for now is to save the buffer as a variable in the background page.
      // This is done first, then an event is sent to the options page.
      eyecanBackground.previewImgArrayBuf = frame.imageData;
  },

  handleConfigChanges : function() {
    // console.log( "handleConfigChanges() called" );

    // detect the camera start and start it:
    var cameraEnabled = eyecanBackground.getConfig( "frame.stream.enabled" );
    var cameraStarted = eyecanCamera.started();

    // console.log( "cameraEnabled: " + cameraEnabled );
    // console.log( "cameraStarted: " + cameraStarted );

    if( cameraEnabled == "1" ) {
      if( cameraStarted == false ) {
        console.log( "cam enabled but not started, turning on.." );
        eyecanCamera.start( function() {  // on camera start success
          chrome.browserAction.setIcon({
            path: {
              19: eyecanVariables.ICON_FILE_19_ON,
              38: eyecanVariables.ICON_FILE_38_ON
            }
          });
        });
      }
      // else: OK
    }
    else { // want it off
      if( cameraStarted == true ) {
        console.log( "cam started but not enabled, turning OFF.." );
        eyecanCamera.stop();
          chrome.browserAction.setIcon({
            path: {
              19: eyecanVariables.ICON_FILE_19_OFF,
              38: eyecanVariables.ICON_FILE_38_OFF
            }
        });
      }
    }
  },

  postDataFile : function( extensionFilePath ) {
    var fileUrl = chrome.extension.getURL( extensionFilePath );
    console.log( "Sending binary file with name: " + extensionFilePath + " URL: " + fileUrl );

    eyecanBackground.loadUrlBinary( 
      fileUrl, 
      function( e ) { // callback on load
        console.log( "Loaded binary file: " + extensionFilePath );
        var payload = {
          type: "fileWrite",
          filePath:  extensionFilePath,
          fileData: this.response
        };

        console.log( "Posting binary file: " + extensionFilePath );
        eyecanBackground.postMessage( payload );
        eyecanBackground.filesSent = eyecanBackground.fileMessages +1;
        eyecanBackground.setCallback( "file" );
      } // callback end
    );
  },

  loadUrlBinary : function( url, onload ) {
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', url, true );
    xhr.responseType = 'arraybuffer';       
    xhr.onload = onload;
    xhr.send();
  },

  onInstalled : function( details ) {
      console.log( "reason: " + details.reason );
      console.log( "previousVersion: " + details.previousVersion );
      console.log( "id: " + details.id );

      if( details.reason == "install" ) {
        //var name = chrome.runtime.getManifest().short_name;
        //if( name == "eyecan" ) {
        //  // Open the options page only on install
        //  chrome.tabs.create({'url': chrome.extension.getURL('options.html') } );
        //}
        //else {
        //  // Open the eyedecide extension camera permission page.
        //  chrome.tabs.create({'url': chrome.extension.getURL('ed_post_install.html') } );
        //}
        var url = eyecanVariables.URL_POST_INSTALL;
        chrome.tabs.create( { 'url': chrome.extension.getURL( url ) } );
      }
      else if( details.reason == "update" ){
        // Nothing
      }
  },

  setupPersistentFs : function() {
    window.webkitRequestFileSystem( window.PERSISTENT, 0,
      function(fs) {
        console.log( "setupPersistentFs(): success" );
        eyecanBackground.persistentFs = fs;
        console.log( "Reading persistent fs contents:" );
        eyecanBackground.listDir( fs, "" );
      },
      function(e) {
        console.log( "setupPersistentFs(): window.webkitRequestFileSystem error" );
        console.log( e );
      });
  },

  clearPersistentFs : function() {
    function errorHandler(e) {
      console.log( "clearPersistentFs() error: " );
      console.log( e );
    }

    eyecanBackground.persistentFs.root.getDirectory( "", {},
      
      function(dirEntry) {
        
        var dirReader = dirEntry.createReader();

        var handleEntries = function( entries ) {
          for(var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if( entry.isDirectory ) {
              console.log( 'Removing directory: ' + entry.fullPath );
              entry.removeRecursively( function() { console.log("Removing directory done"); }, errorHandler );
            }
            else if( entry.isFile ){
              console.log( 'Removing file: ' + entry.fullPath );
              entry.remove( function() { console.log("Removing file done"); }, errorHandler );
            }
          }

          if( entries.length > 0 ) {
            dirReader.readEntries( handleEntries, errorHandler ); // read more as readEntries() may not return all files at once
          }
        }

        // start
        dirReader.readEntries( handleEntries, errorHandler );
      });
  },

  listDir : function( filesystem, dir ) {
    function errorHandler(e) {
      console.log( "Error reading directory: " + dir );
      console.log( e );
    }

    filesystem.root.getDirectory( dir, {}, function(dirEntry){
      var dirReader = dirEntry.createReader();
      dirReader.readEntries(function(entries) {
        for(var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isDirectory){
            console.log('Directory: ' + entry.fullPath);
          }
          else if (entry.isFile){
            console.log('File: ' + entry.fullPath);
          }
        }

      }, errorHandler);
    }, errorHandler);
  },

  reloadExtension : function() {
    window.location.reload();
  },

  // Set params to "null" if you want to ignore that parameter.
  setCameraSettings : function( rate, format, valueFrameWidth, valueFrameHeight ) {
    eyecanCamera.stop();

    // Calibration data are bad when you change resolution. So clear them.
    eyecanBackground.setConfig( "calibration.clear", "1" );

    if (format) {
      eyecanBackground.setPersistentConfig( "frame.stream.format", format );
    }
    if (valueFrameWidth) {
      eyecanBackground.setPersistentConfig( "frame.stream.width",  valueFrameWidth  );
      eyecanBackground.setPersistentConfig( "frame.stream.height", valueFrameHeight );
    }
    if (rate) {
      eyecanBackground.setPersistentConfig( "frame.stream.rate", rate ); // not supported in nacl yet
      eyecanBackground.setPersistentConfig( "frame.stream.frameRateThrottler.enabled", 1 ); // so we use the throttler
      eyecanBackground.setPersistentConfig( "frame.stream.frameRateThrottler.targetFps", rate ); // so we use the throttler
    }

    // Request backend to get ready to reload extension. When backend is ready it
    // sends a message and background.js will reload the extension.
    eyecanBackground.postMessage( { type: "reloadExtension" } );

    eyecanBackground.sendAnalytics( "camera_resolution", "changed" );
    // _gaq.push(['_trackEvent', "camera_resolution", 'changed']);
  },

  onModuleCrash : function() {
    crashProp = {
      since_load_msec: new Date().getTime() - eyecanBackground.extensionLoadTime.getTime()
    }
    eyecanCamera.stop(); // Making sure camera is released.

    // Disable all gui functions
    chrome.browserAction.setPopup({popup: ""});
    var message = function() {
      alert(
        "eyecan' chrome extension has encountered a problem.\n\n" +
        "Please restart chrome.\n\n");

      // The user saw the alert and closed it. So we know the crash wasn't during
      // shutdown/sleep/hibernate.
      eyecanBackground.sendAnalytics( "user_confirmed_crash", "nacl_backend", crashProp );
    }
    chrome.browserAction.onClicked.addListener(function(){
      message();
    });
    chrome.browserAction.setIcon({
      path: {
        19: eyecanVariables.ICON_FILE_19_ERR,
        38: eyecanVariables.ICON_FILE_38_ERR
      }
    });

    // Send analytices before the user action of clicking the dismiss button.
    eyecanBackground.sendAnalytics( "crash", "nacl_backend", crashProp );

    // Show the message that user MUST responde to so we know it's an error that
    // only occurs on shutdown or sleep.
    setTimeout( message, 500 ); // So the extension icon can change before modal alert pops up

    // Redirect to the error port page.
    eyecanUtil.getUserInfo( function(userInfo) {
      chrome.tabs.create({
        'url': '' +
          '?user-id='+userInfo.userId +
          '&background-html-url='+chrome.extension.getURL("background.html")
        });
    });
  },

  onMessageExternal : function( message, sender, sendResponse ) {
    // console.log( "eyecan background onMessageExternal: ");
    // console.log( "message" );
    // console.log( message );
    // console.log( "sender" );
    // console.log( sender );

    if( message.target != "eyecan" ) {
      return;
    }

    // If from an extension, then sender.id is null, so ignore.
    if( message.action == "request-access" ) {
      // Just append to message
      message.extensionId = sender.id;
      eyecanBackground.sendContentScriptMessage( "request-access", message, sender.tab.id );
    }
  },

  sendAnalytics : function( event, action, properties ) {
    _gaq.push(['_trackEvent', event, action]);
    if( typeof(properties) == "undefined" ) {
      properties = {}
    }
    properties.short_name = chrome.runtime.getManifest().short_name;
    mixpanel.track( event + "_" + action, properties );
  },

  sendAnalyticsTrackPageView : function( page_name ) {
    _gaq.push(['_trackPageview']);
    mixpanel.track( "page_view_" + page_name );
  },

  setup : function() {
    document.getElementById( 'realtime' ).addEventListener( 'load', eyecanBackground.onModuleLoad, true );  
    document.getElementById( 'realtime' ).addEventListener( 'crash', eyecanBackground.onModuleCrash, true );
    chrome.runtime.onMessage.addListener( eyecanBackground.onExtensionMessage );
    chrome.runtime.onInstalled.addListener( eyecanBackground.onInstalled );
    chrome.runtime.onMessageExternal.addListener( eyecanBackground.onMessageExternal );
    eyecanBackground.setupPersistentFs();
    // Setting the extension icon is persistent. So we need to reset it every time.
    chrome.browserAction.setIcon( {
      path: {
        19: eyecanVariables.ICON_FILE_19_OFF,
        38: eyecanVariables.ICON_FILE_38_OFF
      }
    });

    eyecanBackground.sendAnalyticsTrackPageView( "background" )
  }
};

eyecanBackground.setup();

