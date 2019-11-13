
var eyecanCalib = {

  // Mouse interval logs, for truth data
  id : 0, // handle to timer
  interval : 10000, // should be configable but this is default
  cancel : false,

  onConfig : function() {

    var calibrationIntervalRequest = parseInt( eyecanContent.getConfig( "calibration.intervalRequest" ) );
    if( calibrationIntervalRequest > 0 ) {
      eyecanCalib.setInterval(); // turn on, if not already
    }
    else {
      eyecanCalib.cancelInterval(); // (schedule to) turn off, if not already
    }
  },

  onInterval : function() {
    //console.log( "calib send request..." );
    eyecanContent.setConfig( "calibration.request", "1" );

    // check whether to cancel having done this last calib:
    if( eyecanCalib.cancel == true ) {
      eyecanCalib.clearInterval();
    }
  },

  setInterval : function() {
    // don't set again, if already set
    if( eyecanCalib.id != 0 ) {
      return;
    }

    //console.log( "set calib interval" );

    // set the interval as defined
    var interval = parseInt( eyecanContent.getConfig( "calibration.interval" ) );
    if( interval > 0 ) {  
      eyecanCalib.interval = interval;
    }
    eyecanCalib.id = setInterval( eyecanCalib.onInterval, eyecanCalib.interval );
    eyecanCalib.cancel = false;

    eyecanCalib.onInterval(); // request 1 now
  },

  cancelInterval : function() {
    eyecanCalib.cancel = true;
  },

  clearInterval : function() {
    if( eyecanCalib.id != 0 ) {
      //console.log( "clear calib interval" );
      clearInterval( eyecanCalib.id ); // stop reminding me
      eyecanCalib.id = 0;
      eyecanCalib.cancel = false;
    }
  }

};



