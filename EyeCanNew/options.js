
chrome.extension.getBackgroundPage().eyecanBackground.sendAnalyticsTrackPageView( "options" )

var eyecanOptions = {

  previewCanvas : null,
  previewCtx : null,
  previewImg : null,

  configRepaintStarted : false,
  configRepaintPending : false,
  configRepaintIntervalMsec : 100,

  allowCamera : AllowCamera(),

  onModeChanged : function() {
    // get mode
    var modeForm = document.getElementById( "mode-form" ); 
    var mode = null;
    for( i = 0; i < modeForm.mode.length; i++ )
    {
      if( modeForm.mode[ i ].checked ) {
        mode = modeForm.mode[ i ].value; //male or female
        break;
      }
    }

    console.log( "Options: Mode changed to: "+ mode );

//    var backgroundPage = chrome.extension.getBackgroundPage();
//    backgroundPage.eyecanBackground.setMode( mode );
    eyecanOptions.setConfig( "system.mode", mode );
  },

  onPersistentClear : function() {
    var r = confirm( "Delete all user data?" );
    if( r == true ) {
      console.log( "Options: clearing all persistent data." );
      var backgroundPage = chrome.extension.getBackgroundPage();
      backgroundPage.eyecanBackground.clearPersistentFs();
      eyecanOptions.setConfig( "calibration.clear", "1" ); // this also clears the memory buffer
    }
  },

  onCalibrationClear : function() {
    var r = confirm( "Delete calibration data?" );
    if( r == true ) {
      console.log( "Options: Calib clear." );
      eyecanOptions.setConfig( "calibration.clear", "1" );
    }
  },
  // onDebugStart : function() {
  //   console.log( "Options: Debug start." );
  //   //var backgroundPage = chrome.extension.getBackgroundPage();
  //   //backgroundPage.eyecanBackground.setCameraEnabled( true );
  //   eyecanOptions.setConfig( "debug.preview.enabled", "1" );
  // },
  // onDebugStop : function() {
  //   console.log( "Options: Debug stop." );
  //   //var backgroundPage = chrome.extension.getBackgroundPage();
  //   //backgroundPage.eyecanBackground.setCameraEnabled( false );
  //   eyecanOptions.setConfig( "debug.preview.enabled", "0" );
  // },
  onCameraStart : function() {
    console.log( "Options: Camera start." );
    //var backgroundPage = chrome.extension.getBackgroundPage();
    //backgroundPage.eyecanBackground.setCameraEnabled( true );
    eyecanOptions.setConfig( "frame.stream.enabled", "1" );
  },
  onCameraStop : function() {
    console.log( "Options: Camera stop." );
    //var backgroundPage = chrome.extension.getBackgroundPage();
    //backgroundPage.eyecanBackground.setCameraEnabled( false );
    eyecanOptions.setConfig( "frame.stream.enabled", "0" );
  },
  // onCameraApply : function() {
  //   console.log( "Options: Camera apply." );

  //   var r = confirm( "Changing camera resolution will reload the extension.\n\n" +
  //                    "Continue?" );
  //   if( r != true ) {
  //     return;
  //   }


  //   // get device
  //   // get resolution
  //   // get format
  //   // get frame rate

  //   var cameraForm = document.getElementById( "camera-form" ); 
  //   var format = null;
  //   for( i = 0; i < cameraForm.format.length; i++ )
  //   {
  //     if( cameraForm.format[ i ].checked ) {
  //       format = cameraForm.format[ i ].value; //male or female
  //       break;
  //     }
  //   }

  //   var rate = document.getElementById( "rate" ).value;
  //   var selectResolution = document.getElementById( "resolution" );
  //   var valueResolution  = selectResolution.options[ selectResolution.selectedIndex ].value;

  //   //console.log( "val res="+valueResolution );

  //   var startWidth  = 0;    
  //   var   endWidth  = valueResolution.indexOf( "x" );    
  //   var startHeight = endWidth +1;    
  //   var   endHeight = valueResolution.length;    

  //   //console.log( "startW="+startWidth+" endW="+endWidth+" startH="+startHeight+" endH="+endHeight );

  //   var valueFrameWidth  = valueResolution.substring( startWidth , endWidth  );
  //   var valueFrameHeight = valueResolution.substring( startHeight, endHeight );

  //   console.log( "Options: Camera apply: rate: "+rate+" format: "+format+" width: "+valueFrameWidth+" height: "+valueFrameHeight );
  //   var backgroundPage = chrome.extension.getBackgroundPage();
  //   backgroundPage.eyecanBackground.setCameraSettings( rate, format, valueFrameWidth, valueFrameHeight ); // send null to ignore

  //   // Reload current tab
  //   setTimeout( function() {
  //     var url = [location.protocol, '//', location.host, location.pathname].join('');
  //     window.location.href = url + "#tab3";
  //     window.location.reload();
  //   }, 1000 );
  // },

  onModuleLoad : function() {
  },

  onModuleStart : function() {
    console.log( "Options: Module start" );
    var backgroundPage = chrome.extension.getBackgroundPage();
    backgroundPage.eyecanBackground.onModuleStart();
  },

  onModuleStop : function() {
    console.log( "Options: Module stop" );
    var backgroundPage = chrome.extension.getBackgroundPage();
    backgroundPage.eyecanBackground.onModuleStop();
  },

  // onFrameMessage : function( msg ) {
  //   if( !eyecanOptions.previewCanvas ) {
  //     eyecanOptions.previewCanvas = document.getElementById('previewCanvas');
  //     eyecanOptions.previewCtx = eyecanOptions.previewCanvas.getContext('2d');
  //     eyecanOptions.previewImg = eyecanOptions.previewCtx.createImageData( msg.width, msg.height );
  //   }

  //   if(    eyecanOptions.previewCanvas.width  != msg.width
  //       || eyecanOptions.previewCanvas.height != msg.height ) {
  //     eyecanOptions.previewCanvas.width  = msg.width;
  //     eyecanOptions.previewCanvas.height = msg.height;
  //   }

  //   var buf = chrome.extension.getBackgroundPage().eyecanBackground.previewImgArrayBuf;

  //   eyecanOptions.previewImg.data.set( new Uint8ClampedArray( buf ) );
  //   eyecanOptions.previewCtx.putImageData( eyecanOptions.previewImg, 0, 0 );
  // },


  onMessage : function( e ) {
    //console.log( "Options: onMessage: " );//+ JSON.stringify( e ) );
   
    if( e.config != null ) {
      //console.log( "Options onMessage: is config." );
      eyecanOptions.onModuleConfig( e.config );
    }
    // else if( e.type == "frame" ) {
    //   // console.log( "Got frame" );
    //   eyecanOptions.onFrameMessage( e );
    // }


    // can be a frame
    //else {
    //  console.log( "Error: Message doesn't specify config property." );
    //}
  },

  configRepaint : function() {
    if( !eyecanOptions.configRepaintPending ) {
      // If no more pending, then don't schedule any more repaints
      eyecanOptions.configRepaintStarted = false;
      return;
    }

    // Repaint
    var backgroundPage = chrome.extension.getBackgroundPage();
    var html = eyecanUtil.json2html( backgroundPage.eyecanBackground.config );
    var e = document.getElementById( "config" );
    if( e ) {
      e.innerHTML = html; 
    }

    // store the mode and show in UI:
    var mode = eyecanOptions.getConfig( "system.mode" );
    var modeForm = document.getElementById( "mode-form" ); 

    if( modeForm ) {
     for( i = 0; i < modeForm.mode.length; i++ )
     {
      if( modeForm.mode[ i ].value == mode ) {
        modeForm.mode[ i ].checked = 1;
      }
      else {
        modeForm.mode[ i ].checked = 0;
      }
     }
    }

    // Reset and schedule another one
    // TODO: maybe we should do this are the start of function to keep timing accurate
    eyecanOptions.configRepaintPending = false;
    setTimeout( eyecanOptions.configRepaint, eyecanOptions.configRepaintIntervalMsec );
  },

  onModuleConfig : function( configString ) {
    eyecanOptions.configRepaintPending = true;

    if( !eyecanOptions.configRepaintStarted ) {
      eyecanOptions.configRepaintStarted = true;
      eyecanOptions.configRepaint();
    }
  }, 

  toggleAdvanced : function() {
    eyecanOptions.toggleShowDiv( "advanced-toggle", "advanced-show" );
  },

  togglePreview : function() {
    eyecanOptions.toggleShowDiv( "preview-toggle", "preview-show" );
  },

  toggleCamera : function() {
    eyecanOptions.toggleShowDiv( "camera-toggle", "camera-show" );
  },

  //toggleConfig : function() {
  //  eyecanOptions.toggleShowDiv( "config-toggle", "config-show" );
  //},

  toggleShowDiv : function( divId, toggleId ) {
    // cameraConfig.stop();

    var div = document.getElementById( divId );
    var input = document.getElementById( toggleId );

    if( !input ) {
      return;
    }

    if( input.checked ) {
      div.style.display = "block";      
    }
    else {
      div.style.display = "none";      
    }
  },

  getConfig : function( path ) {
    var backgroundPage = chrome.extension.getBackgroundPage();
    var value = backgroundPage.eyecanBackground.getConfig( path );
//console.log( "getConfig: "+value );
    return value;
  },

  setConfigApply : function() {
    var path  = document.getElementById( "config-path" ).value;
    var value = document.getElementById( "config-value" ).value;
    eyecanOptions.setConfig( path, value );
  },

  setConfig : function( path, value ) {
    console.log( "Options: setConfig( "+ path + "=" + value + ")" );
    var backgroundPage = chrome.extension.getBackgroundPage();
    backgroundPage.eyecanBackground.setConfig( path, value );
  },

/*  onCameraSuccess : function( frameStream ) {
  },

  onCameraFailure : function() {
  },*/

  onHasCameraPermissionInBG : function() {
    eyecanOptions.allowCamera.hide();

    var element = document.getElementById('attention');
    if( element ) {
      //console.log( "element:" );
      //console.log( element );
      element.style.background = "#006ebf";
      element.innerHTML = "<a href='http://eyecagaze.com/showcase/' style='color:white;text-decoration:none' target='new'>Click for demo apps!</a>";
    }
  },

  getCameraPermissionInBG : function() {
    var backgroundPage = chrome.extension.getBackgroundPage();

    // ------------------------------------------------
    // 1st time, in BG page
    // ------------------------------------------------
    backgroundPage.eyecanCamera.openCamera(
      null, // no constraints
      function(stream) { // onSuccessUser
        console.log( "Camera started in BG page." );
        eyecanCamera.stopStream( stream );
        eyecanOptions.onHasCameraPermissionInBG();
      },
      function() { //onErrorUser
        console.log( "Camera didn't start in BG page." );
        console.log( "Trying to start in options page." );

        eyecanOptions.allowCamera.show();
        
        // ------------------------------------------------
        // 2st time, in options page
        // ------------------------------------------------
        eyecanCamera.openCamera(
          null, // no constraints
          function( stream ) { // onSuccessUser
            console.log( "Camera started in options page." );
            console.log( "Closing camera." );
            eyecanCamera.stopStream( stream );
            eyecanOptions.onHasCameraPermissionInBG();
            console.log( "Trying to start in BG page again." );
            // ------------------------------------------------
            // 3rd time, in BG page again
            // ------------------------------------------------
            backgroundPage.eyecanCamera.openCamera(
              null, // no constraints
              function() { // onSuccessUser
                console.log( "Camera started in BG page." );
                eyecanCamera.stopStream( stream );
              },
              function() { //onErrorUser
                console.log( "Camera didn't start in BG page, but it worked in options page." );
              });
          },
          function() { //onErrorUser
            console.log( "Camera didn't start in options page, did you give permissions?." );
          }); // will not start if already started.
      });
  },

  // initCameraConfig : function() {
  //   // Wait for config to arrive
  //   fps = parseInt(eyecanOptions.getConfig( "frame.stream.frameRateThrottler.targetFps" ));
  //   if( !fps ) {
  //     setTimeout( eyecanOptions.initCameraConfig, 100 );
  //     return;
  //   }

  //   // Get all relevant configs
  //   width  = parseInt(eyecanOptions.getConfig( "frame.stream.width" ));
  //   height = parseInt(eyecanOptions.getConfig( "frame.stream.height" ));

  //   // Set the frame rate field
  //   rateElement = document.getElementById('rate');
  //   rateElement.value = fps;

  //   // Select the resolution field
  //   resolutionElement = document.getElementById( "resolution" );
  //   // Find the matching resolution
  //   for( i = 0; i < resolutionElement.options.length; ++i ) {
  //     regex = new RegExp(width+"x"+height, "gi");
  //     var s = resolutionElement.options[i].value;

  //     if( s.match(regex) !== null ) {
  //       resolutionElement.selectedIndex = i;
  //       break;
  //     }
  //   }

  //   //TODO: Select the frame format
  // },

  // Use anchor tags to control which tab is visible.
  showTabByHash : function() {
    var hash = window.location.hash.substring(1);
    if( hash ) {
      // Because this js file is supporting both eyecan and eyesdecide extension
      // we need to allow missing tabs.
      function setChecked(id, checked) {
        elem = document.getElementById(id);
        if( elem ) {
          if( checked ) {
            elem.setAttribute("checked", true);

            // It takes some time for the system to restart properly.
            setTimeout(function() {
              eyecanOptions.onTabChange(elem);
            }, 1000);
          }
          else {
            elem.removeAttribute("checked");
          }
        }
      }
      setChecked("tab1", false);
      setChecked("tab2", false);
      setChecked("tab3", false);
      setChecked("tab4", false);
      setChecked("tab5", false);
      setChecked("tab6", false);
      setChecked(hash, true);
    }
    else {
      document.getElementById("tab1").setAttribute("checked", true);
    }
  },

  startCameraPreview : function() {
    cameraConfig.start();    
  },

  onTabChange : function(tabElem) {
    if (tabElem.id == "tab3" && tabElem.checked) {
      eyecanOptions.startCameraPreview();
    }
    else {
      cameraConfig.stop();
    }
  },

  setup : function() {
    var buttons = document.querySelectorAll( 'button' );
  
    [].forEach.call( buttons, function( button ) {
      button.addEventListener( 'click', function( e ) {
        switch( e.target.id ) {
//          case 'mode-apply'  : eyecanOptions.onModeApply(); break; 
          case 'realtime-start' : eyecanOptions.onModuleStart(); break; 
          case 'realtime-stop'  : eyecanOptions.onModuleStop(); break; 
          case 'camera-start' : eyecanOptions.onCameraStart(); break; 
          case 'camera-stop'  : eyecanOptions.onCameraStop(); break; 
          // case 'debug-start' : eyecanOptions.onDebugStart(); break; 
          // case 'debug-stop'  : eyecanOptions.onDebugStop(); break; 
        }
      } ); // event listener
    } ); // call

    // add version to about tab:
    var versionDiv = document.getElementById( "version" );
    var manifest = chrome.runtime.getManifest();
    versionDiv.innerHTML = "Version " + manifest.version;
  
    // add listener to input buttons:
    // var cameraApplyButton = document.getElementById( "camera-apply" );
    // cameraApplyButton.onclick = function() {
    //   eyecanOptions.onCameraApply();
    // }
    // eyecanOptions.initCameraConfig();

    function addTabChangeListener(tab) {
      var tab = document.getElementById(tab);
      if (tab) {
        tab.addEventListener("change", function() {
          eyecanOptions.onTabChange(this);
        });
      }
    }

    addTabChangeListener("tab1");
    addTabChangeListener("tab2");
    addTabChangeListener("tab3");
    addTabChangeListener("tab4");
    addTabChangeListener("tab5");
    addTabChangeListener("tab6");

    // add listeners to radio buttons:
    if( document.forms[ "mode-form" ] ) {
     var modeRadios = document.forms[ "mode-form" ].elements[ "mode" ];
     for( var i = 0, max = modeRadios.length; i < max; i++ ) {
      modeRadios[ i ].onclick = function() {
        eyecanOptions.onModeChanged();
      }
     }
    }

    // add listener to config set:
    var e1 = document.getElementById( "config-submit" );
    if( e1 ) { e1.onclick = function() { eyecanOptions.setConfigApply(); }; }

    var e2 = document.getElementById( "advanced-show" );
    if( e2 ) { e2.onclick = function() { eyecanOptions.toggleAdvanced(); }; }

    var e3 = document.getElementById( "persistent-clear" );
    if( e3 ) { e3.onclick = function() { eyecanOptions.onPersistentClear(); }; }

    var e4 = document.getElementById( "calibration-clear" );
    if( e4 ) { e4.onclick = function() { eyecanOptions.onCalibrationClear(); }; }

    chrome.runtime.onMessage.addListener( eyecanOptions.onMessage );

    //eyecanCamera.setup();// "eyecan" ); // assumes an eyecan div to work in
    //eyecanCamera.setFrameCallback( myFunc );
    //eyecanCamera.start( 640, 480, 3 );
 
    // align UI features with state:
    eyecanOptions.toggleAdvanced();
//    eyecanOptions.togglePreview();
//    eyecanOptions.toggleCamera();
//    eyecanOptions.toggleConfig();

    // Load current config for controls:
    // mode:
    // [camera] format:
    // [camera] [frame]rate:
    // [camera] resolution:
    //eyecanCamera.setup( "eyecan" );
    
    // check whether the background page was able to access the camera. If not, then request permission for it.
    eyecanOptions.getCameraPermissionInBG();
    // eyecanCamera.start(); // will not start if already started.
    // console.log( "Tried to start camera in options page" );
      //navigator.webkitGetUserMedia( {'video': true}, eyecanOptions.onCameraSuccess, eyecanOptions.onCameraFailure );

    // Refresh the config state on load
    eyecanOptions.onModuleConfig( JSON.stringify( chrome.extension.getBackgroundPage().config ) );
  
    eyecanOptions.showTabByHash();
  }

};

eyecanOptions.setup();


