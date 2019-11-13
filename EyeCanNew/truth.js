
var eyecanTruth = {

  // Mouse interval logs, for truth data
  xScreen : 0,
  yScreen : 0,
  t1 : 0,
  id : 0, // handle to timer
  interval : 50, // should be configable but this is default
 
  getCsvIntervalScreen : function( t1, t2, xs, ys ) {
    // Defines ordering of values
    // t1,t2,xs,ys
    // For truth, also used for clicks
    var csv = t1 + "," + t2 + "," + xs + "," + ys;
    return csv;    
  },

  onMouseDown : function() {
    var truthMouse  = parseInt( eyecanContent.getConfig( "truth.mouse" ) );
    if( truthMouse != 0 ) {
      eyecanTruth.setInterval(); // start recording truth
    }
  },

  onMouseUp : function() {
    var truthMouse  = parseInt( eyecanContent.getConfig( "truth.mouse" ) );
    if( truthMouse != 0 ) {
      eyecanTruth.clearInterval(); // stop recording truth
    }
  },

  onConfig : function() {
    //console.log( "truth on config" );
    //var truthMouse  = parseInt( eyecanContent.getConfig( "truth.mouse" ) );
    //var truthEnable = parseInt( eyecanContent.getConfig( "truth.enabled" ) ); 
    //
    //if( truthMouse > 0 ) {
    //  return; // mouse decides when truth is recording (ie on click
    //}
    //
    // else: 3rd party decides when truth should record
    //if( truthEnable > 0 ) {
    //  //console.log( "truth on config set interval." );
    //  eyecanTruth.setInterval(); // turn on, if not already
    //}
    //else {
    //  eyecanTruth.clearInterval(); // turn off, if not already
    //}
  },

  onInterval : function() {
    //console.log( "on truth interval" );
    // this is called regardless of the origin of the truth data.
    // either mouse, or set as a config property
    //var truthEnable = parseInt( eyecanContent.getConfig( "truth.enabled" ) );
    //if( truthEnable == 0 ) {
    var truthMouse  = parseInt( eyecanContent.getConfig( "truth.mouse" ) );
    if( truthMouse == 0 ) {
      //console.log( "on truth interval but not enabled" );
      return; // not appending
    }

    //console.log( "on truth interval: ENABLED="+truthEnable+" as string:"+eyecanContent.getConfig( "truth.enabled" ) );
    var x  = 0;
    var y  = 0;
    var t1 = eyecanTruth.t1;
    var t2 = eyecanUtil.getTimestamp();

    if( t1 <= 0 ) { // none set
      t1 = t2;
      t2 = t2 +1; // ensure duration at least 1 for alan
    }

    //var truthMouse  = parseInt( eyecanContent.getConfig( "truth.mouse" ) );
    //if( truthMouse != 0 ) {
      x = eyecanContent.xMouseScreen;
      y = eyecanContent.yMouseScreen;
    //}
    //else {
    //  x = parseInt( eyecanContent.getConfig( "truth.x" ) );
    //  y = parseInt( eyecanContent.getConfig( "truth.y" ) );
    //}    

    var csv = eyecanTruth.getCsvIntervalScreen( t1, t2, x, y );
    //console.log( "APPEND truth interval data:"+ csv + "@ time="+ eyecanUtil.getTimestamp() );
    eyecanContent.setConfig( "truth.append", csv );

    eyecanTruth.t1 = t2; // change the timestamp
  },

  setInterval : function() {
    // don't set again, if already set
    if( eyecanTruth.id != 0 ) {
      return;
    }

    //console.log( "set truth interval" );

    // set the interval as defined
    eyecanTruth.onInterval(); // prepare any pending interval

    var interval = parseInt( eyecanContent.getConfig( "truth.interval" ) );
    if( interval > 0 ) {  
      eyecanTruth.interval = interval;
    }
    eyecanTruth.id = setInterval( eyecanTruth.onInterval, eyecanTruth.interval );
  },

  clearInterval : function() {
    if( eyecanTruth.id == 0 ) {
      return;
    }

    // console.log( "clear truth interval" );
    eyecanTruth.onInterval(); // clear any pending interval

    clearInterval( eyecanTruth.id ); // stop reminding me
    eyecanTruth.id = 0;
    eyecanTruth.t1 = 0;
  }

};



