
///////////////////////////////////////////////////////////////////////////////////////////////////
// Error and warning detection with debouncing and easy handling of multiple error conditions.
///////////////////////////////////////////////////////////////////////////////////////////////////
var eyecanErrors = {

  FREQUENCY_THRESHOLD : 0.15, // this is for UI control but is pretty OK for any machine
  LEARNING_RATE : 0.1, // debouncing of errors

  MESSAGE_FACE   : "Can't see a face.",
  MESSAGE_POSE   : "Bad pose: Centre your face in the camera image.",
  MESSAGE_TRACK  : "Tracking suspended.",
  MESSAGE_SIZE   : "Low resolution / face too small.",
  MESSAGE_DARK   : "Too dark! (reduces accuracy).",
  MESSAGE_BRIGHT : "Too bright! (reduces accuracy).",
  MESSAGE_UNEVEN : "Uneven lighting (reduces accuracy).",

  errorMessage : "",
  warningMessage : "",

  freqErrorTrack : 0.0,
  freqErrorFace : 0.0,
  freqErrorPose : 0.0,

  freqWarningSize : 0.0,
  freqWarningDark : 0.0,
  freqWarningBright : 0.0,
  freqWarningUneven : 0.0,

  hasError : function() {
    if( eyecanErrors.errorMessage.length > 0 ) {
      return true;
    }
    return false;
  },

  hasErrorExcludingPose : function() {
    if( eyecanErrors.errorMessage.length > 0 ) {
      if( eyecanErrors.errorMessage == eyecanErrors.MESSAGE_POSE ) {
        return false;
      }

      return true;
    }
    return false;
  },

  hasWarning : function() {
    if( eyecanErrors.warningMessage.length > 0 ) {
      return true;
    }
    return false;
  },

  hasNoFace : function() {
    if( Errors.freqError( Errors.freqErrorFace ) ) {
      return true;
    }
    return false;
  },

  hasBadPose : function() {
    var x = parseFloat( eyecanContent.getConfig( "state.head.x" ) );
    var y = parseFloat( eyecanContent.getConfig( "state.head.y" ) );
    var t = parseFloat( eyecanContent.getConfig( "algorithm.validation.headCentreDistanceThreshold" ) );
    return eyecanErrors.distanceThreshold( x, y, t );
  },
  hasBadPoseX : function() {
    var x = parseFloat( eyecanContent.getConfig( "state.head.x" ) );
    var t = parseFloat( eyecanContent.getConfig( "algorithm.validation.headCentreDistanceThreshold" ) );
    return eyecanErrors.distanceThreshold( x, 0.0, t );
  },
  hasBadPoseY : function() {
    var y = parseFloat( eyecanContent.getConfig( "state.head.y" ) );
    var t = parseFloat( eyecanContent.getConfig( "algorithm.validation.headCentreDistanceThreshold" ) );
    return eyecanErrors.distanceThreshold( 0.0, y, t );
  },

  freqError : function( frequency ) {
//    var threshold = 0.15; // e.g. 0.15 = 15%
    if( frequency > eyecanErrors.FREQUENCY_THRESHOLD ) {
      return true;
    }
    return false;
  },

  distanceThreshold : function( xh, yh, threshold ) {
    var d = eyecanUtil.distance( 0.0, 0.0, xh, yh );
    if( d > threshold ) {
      return true;
    }
    return false;
  },

  update : function() {
    var trackingSuspended = parseInt( eyecanContent.getConfig( "state.trackingSuspended" ) );
    var calibrationStatus = parseInt( eyecanContent.getConfig( "calibration.status" ) );
    var errors = eyecanContent.getConfig( "validation.errors" );

    // build a prioritized error/warning message string:
    // Face detection
    var error = 0.0;
    if( errors.indexOf( "F" ) >= 0 ) {
      error = 1.0;
    }
    eyecanErrors.freqErrorFace = eyecanUtil.lerp( eyecanErrors.freqErrorFace, error, eyecanErrors.LEARNING_RATE );

    // Tracking
    error = 0.0;
    if( trackingSuspended > 0 ) {
      error = 1.0;
    }
    eyecanErrors.freqErrorTrack = eyecanUtil.lerp( eyecanErrors.freqErrorTrack, error, eyecanErrors.LEARNING_RATE );

    // Pose (centred in camera)
    error = 0.0;
    if( eyecanErrors.hasBadPose() ) {
      error = 1.0;
    }
    eyecanErrors.freqErrorPose = eyecanUtil.lerp( eyecanErrors.freqErrorPose, error, eyecanErrors.LEARNING_RATE );

    // Size/resolution
    error = 0.0;
    if( errors.indexOf( "R" ) >= 0 ) {
      error = 1.0;
    }
    eyecanErrors.freqWarningSize = eyecanUtil.lerp( eyecanErrors.freqWarningSize, error, eyecanErrors.LEARNING_RATE );

    // Uneven lighting
    error = 0.0;
    if( errors.indexOf( "U" ) >= 0 ) {
      error = 1.0;
    }
    eyecanErrors.freqWarningUneven = eyecanUtil.lerp( eyecanErrors.freqWarningUneven, error, eyecanErrors.LEARNING_RATE );

    // Bright
    error = 0.0;
    if( errors.indexOf( "B" ) >= 0 ) {
      error = 1.0;
    }
    eyecanErrors.freqWarningBright = eyecanUtil.lerp( eyecanErrors.freqWarningBright, error, eyecanErrors.LEARNING_RATE );

    // Dark
    error = 0.0;
    if( errors.indexOf( "D" ) >= 0 ) {
      error = 1.0;
    }
    eyecanErrors.freqWarningDark = eyecanUtil.lerp( eyecanErrors.freqWarningDark, error, eyecanErrors.LEARNING_RATE );

    // prioritize errors:
    var errorMessage = "";
    if( eyecanErrors.freqError( eyecanErrors.freqErrorFace ) ) {
      errorMessage = eyecanErrors.MESSAGE_FACE;//"Can't see a face.";
    }
    else if( eyecanErrors.freqError( eyecanErrors.freqErrorPose ) ) { // have a face, but not tracking
      errorMessage = eyecanErrors.MESSAGE_POSE;//"Bad pose: Centre your face in the camera image.";
    }
    //else if( calibrationStatus == 0 ) { // have a face, but not tracking. This doesn't change fast so no smoothing
    //  errorMessage = "Not yet calibrated.";
    //}
    else if( eyecanErrors.freqError( eyecanErrors.freqErrorTrack ) ) { // have a face, but not tracking
      errorMessage = eyecanErrors.MESSAGE_TRACK;//"Tracking suspended.";
    }

    // prioritize warnings:
    var warningMessage = "";

    if( eyecanErrors.freqError( eyecanErrors.freqWarningSize ) ) {
      warningMessage = eyecanErrors.MESSAGE_SIZE;//"Low resolution / face too small.";
    }
    else if( eyecanErrors.freqError( eyecanErrors.freqWarningDark ) ) { // have a face, but not tracking
      warningMessage = eyecanErrors.MESSAGE_DARK;//"Too dark! (reduces accuracy).";
    }
    else if( eyecanErrors.freqError( eyecanErrors.freqWarningBright ) ) { // have a face, but not tracking. This doesn't change fast so no smoothing
      warningMessage = eyecanErrors.MESSAGE_BRIGHT;//"Too bright! (reduces accuracy).";
    }
    else if( eyecanErrors.freqError( eyecanErrors.freqWarningUneven ) ) { // have a face, but not tracking
      warningMessage = eyecanErrors.MESSAGE_UNEVEN;//"Uneven lighting (reduces accuracy).";
    }

    eyecanErrors.errorMessage = errorMessage;
    eyecanErrors.warningMessage = warningMessage;
  }

};



