
// Adds an invisible div that indictates the eyecan extension is installed.
(function() {

    // The flag that indicates at least one of the eyecan extensions is installed.
    document.documentElement.setAttribute( 'data-eyecan-extension', 1 );
    document.documentElement.setAttribute( 'data-eyecan-extension-ready', 0 );

    var manifest = chrome.runtime.getManifest();
    switch( manifest.short_name ) {
        case( "eyecan" ):
            var attr = 'data-eyecan-extension-version';
            break;
        case( "EyesDecide" ):
            var attr = 'data-eyesdecide-extension-version';
            break;
        default:
            throw "Unknown short_name: " + manifest.short_name;
    }

    document.documentElement.setAttribute( attr, manifest.version );

})();

