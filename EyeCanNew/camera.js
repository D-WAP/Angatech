
var eyecanCamera = {

//  active: false,
//  onFrame: null, // set this to a callback
//  frameIdx: 0,
//  frameRate: null, // target frame rate
  frameStream: null, // source of images
//  videoElement: null, // injected into the page that adds the camera

/*  setFrameCallback: function( callback ) {
    eyecanCamera.onFrame = callback;
  },

  setFrameRate: function( frameRate ) {
    eyecanCamera.frameRate = frameRate;
  },

  getFrameSize: function( width, height, comment ) {
    return { width: width, height: height, comment: comment };
  },

  getFrameSizes: function() {
    return [
        getFrameSize( 1280, 720, "16:9" )
      , getFrameSize(  960, 720, " 4:3" )
      , getFrameSize(  640, 360, "16:9" )
      , getFrameSize(  640, 480, " 4:3" )
      , getFrameSize(  320, 240, " 4:3" )
      , getFrameSize(  320, 180, "16:9" )
    ];
  },*/

  onSuccess: function( frameStream ){
    console.log( "eyecan camera: Success, posting new stream object to NaCl..." );
    if( !!eyecanCamera.frameStream ) {
      eyecanCamera.frameStream.getVideoTracks()[0].stop();
    }
    eyecanCamera.frameStream = frameStream;
    //eyecanCamera.videoElement.src = ( window.URL && window.URL.createObjectURL( frameStream ) ) || frameStream; // copied from example
    //eyecanCamera.videoElement.play();
    var payload = {
      type: 'streamStart',
      resource: frameStream.getVideoTracks()[0]
    }

    //var backgroundPage = chrome.extension.getBackgroundPage();
    //backgroundPage.eyecanBackground.postMessage( payload );
    eyecanBackground.postMessage( payload );
  },

  onError: function( error ) {
    if( error.name == "PermissionDeniedError" ) {
      alert( "eyecan: Error, webcam access denied by user setting. Go to chrome://settings to fix." );
    }
    console.log( "eyecan camera: Error " + error.name );
  },

  stopStream : function(stream) {
    // MediaStream.stop() is removed in Chrome 47
    if( typeof stream.stop === "function" ) {
      // For chrome < 47
      stream.stop();
    }
    else {
      // For chrome >= 47
      stream.getVideoTracks().forEach( function(track) {
        track.stop();
      });
    }
  },

  stop: function() {
    console.log( "eyecan camera: Stop:" );
    //eyecanCamera.active = false;

    // this is supposed to actually release the hardware:
    if( !!eyecanCamera.frameStream ) {
      console.log( "eyecan camera: Stopping..." );

      // tell realtime to release the camera stream
      var payload = {
        type: 'streamStop'
      }

      eyecanBackground.postMessage( payload );

      // http://stackoverflow.com/questions/11642926/stop-close-webcam-which-is-opened-by-navigator-getusermedia
      // eyecanCamera.frameStream.getVideoTracks()[0].stop();
      eyecanCamera.stopStream( eyecanCamera.frameStream );
      //eyecanCamera.frameStream.stop();
      eyecanCamera.frameStream = null;
    }

    eyecanCamera.opened = false;
    console.log( "eyecan camera: Stopped." );
  },

  started : function() {
    // if( !!eyecanCamera.frameStream ) {
    //   return true;
    // }
    // return false;
    return eyecanCamera.opened;
  },

  // You can pass null as constraints
  openCamera : function( constraints, onSuccessUser, onErrorUser ) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    if( constraints == null ) {
      constraints = { audio: false, video: true };
    }
    
    if( navigator.getUserMedia ) {
      console.log( "eyecan camera: getUserMedia()" );
      navigator.getUserMedia( constraints, onSuccessUser, onErrorUser );
    }
    else {
      console.log( "eyecan camera: openCamera(): Error with getUserMedia request." );
      onErrorUser( "Error with getUserMedia request." );
    }

  },

  opened : false,

  start : function( onSuccessUser, onErrorUser ) {//, frameRate ) {
    
    console.log( "eyecan camera: Start:" );

    if( eyecanCamera.started() ) {
      console.log( "eyecan camera: Already started." );
      if( onSuccessUser ) {
        onSuccessUser();
      }
      return;
    }

    console.log( "eyecan camera: Starting..." );
    eyecanCamera.opened = true;
    
//    eyecanCamera.frameRate = frameRate;
    // var width  = eyecanBackground.getConfig( "frame.stream.width" );  
    // var height = eyecanBackground.getConfig( "frame.stream.height" );  
    // var format = eyecanBackground.getConfig( "frame.stream.format" );  
    // var rate   = eyecanBackground.getConfig( "frame.stream.rate" );  

    // console.log( "eyecan camera: width="+width+" height=" + height+ " format=" + format+ " rate=" + rate );

    eyecanCamera.openCamera( 
      null, // no constraints
      function( stream ) { // onSuccess
        eyecanCamera.onSuccess( stream );
        if( onSuccessUser ) {
          onSuccessUser( stream );
        }
      },
      function( error ) { // onError
        eyecanCamera.onError( error );
        if( onErrorUser ) {
          eyecanCamera.opened = false;
          onErrorUser( error );
        }
      });
  }

};
