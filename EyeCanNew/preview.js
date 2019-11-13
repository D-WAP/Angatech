var eyecanPreview = {

  enabled : false,
  videoElementId : "eyecanPreview",
  stream : null,

  setEnabled : function( enabled ) {
    if( eyecanPreview.enabled == enabled ) {
      return;
    }
    // console.log( "preview enabled changed, new="+enabled );

    eyecanPreview.enabled = enabled;

    if( enabled ) {
      eyecanPreview.start();
    }
    else {
      eyecanPreview.stop();
    }
  },

  stop : function() {
    var videoElement = document.getElementById( eyecanPreview.videoElementId );
    if( videoElement && eyecanPreview.stream ) {
      console.log( "eyecan: Closing video stream..." );
      //videoElement.src = null;
      eyecanCamera.stopStream( eyecanPreview.stream );
      eyecanPreview.stream = null;
    }  
  },

  start : function() {
    var videoElement = document.getElementById( eyecanPreview.videoElementId );
    if( !videoElement ) {
      console.log( "eyecan: Video element not found." );
      return;
    }

    var width  = eyecanContent.getConfig( "frame.stream.width"  );
    var height = eyecanContent.getConfig( "frame.stream.height" );

    if( width && height ) {
      var intWidth  = parseInt( width  );
      var intHeight = parseInt( height );
      eyecanPreview.openCamera( intWidth, intHeight );
    }
    else {
      console.log( "eyecan: Video frame size not valid." );
    }
  },

  openCamera : function( width, height ) {

//    console.log( "width, height: " + width + ", " + height );

/*    var constraints = {
      "audio": false,
      "video": {
        "mandatory": {
          "maxWidth":  width,
          "maxHeight": height
        }
      }
    };
    // var constraints = { "audio": false, "video": true };
*/   
    //console.log( "eyecanPreview.openCamera: ");
//    console.log( JSON.stringify( constraints ) );

/*    eyecanCamera.openCamera(
      constraints,
      eyecanPreview.onSuccess,
      function( e ) { 
        console.log( "eyecanPreview.openCamera() error: " + JSON.stringify( e ) );
      } 
    );*/
   
    navigator.getUserMedia = ( 
      navigator.getUserMedia       || 
      navigator.webkitGetUserMedia || 
      navigator.mozGetUserMedia    || 
      navigator.msGetUserMedia );

    if( navigator.getUserMedia ) {
      // Request access to video only
      navigator.getUserMedia(
         { video:true, audio:false }, 
         eyecanPreview.onSuccess,
         eyecanPreview.onError
      );
    }
    else {
      alert( 'eyecan: Sorry, the browser you are using doesn\'t support getUserMedia' );
      return;
    }
    //console.log( "eyecanPreview.openCamera() complete.");
  },

  onError : function( error ) {
    var text = 'eyecan: Camera fault, error code: ' + error.code + '.';
    //alert( text );
    console.log( text );
  },

  onSuccess : function( stream ) {
    //console.log( "eyecanPreview.onSuccess() ");
    eyecanPreview.stream = stream;
    var video = document.getElementById( eyecanPreview.videoElementId );
    video.src = window.webkitURL.createObjectURL( stream );
    video.play();

/*         function( stream) {
            var url = window.URL || window.webkitURL;
            v.src = url ? url.createObjectURL(stream) : stream;
            v.play();
         },*/
  }

}

