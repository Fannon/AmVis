/////////////////////////
// Variables           //
/////////////////////////

/**
 * Global Namespace, Singleton
 */
var visualisation = {};
visualisation.programs = {};

/**
 * Array with available Foreground Programs
 * @type {Array}
 */
visualisation.availablePrograms = [
    'simpleBackground',
    'colorpalette'
];



////////////////////////////
// Visualisation Handling //
////////////////////////////

visualisation.setProgram = function(program) {
    // TODO: Check if available

    // TODO: Stop old Program
    visualisation.stopCurrentProgram();

    // Start new Program
    visualisation.programs[visualisation.foreground]();
    visualisation.currentProgram = program;
};

visualisation.stopCurrentProgram = function() {
    // TODO: Stop current Program
}


visualisation.setBackground = function(program) {
    // TODO: Check if available
    visualisation.background = program;
    visualisation.programs[visualisation.background]();
};


///////////////////////
// Programs          //
///////////////////////

/**
 * Colorpalette Plugin
 * Analysiert die aktuellen Farben und gibt dazu passende Farbpaletten und -informationen aus
 *
 * @author Simon Heimler
 */
visualisation.programs.colorpalette = function() {

    setInterval(function(){
        var metaDataObject = calculateMetaData();

        if (metaDataObject) {
            var imageData = metaDataObject['image'];
            var html = '<div id="colordebug">';

            html += '<div style="background-color: #000">Motion Score: ' + imageData.motion_score + '</div><br>';

            html += '<div style="background-color: ' + imageData.dominant.toCSS() + '">DOMINANT</div><br>';

            for (var j = 0; j < imageData.palette.length; j++) {
                html += '<div style="background-color: ' + imageData.palette[j].toCSS() + '">PALETTE</div>';
            }

            html += '<br>';

            for (j = 0; j < imageData.analog_custom.length; j++) {
                html += '<div style="background-color: ' + imageData.analog_custom[j].toCSS() + '">ANALOG CUSTOM</div>';
            }

            html += '<br>';

            for (j = 0; j < imageData.analog.length; j++) {
                html += '<div style="background-color: ' + imageData.analog[j].toCSS() + '">ANALOG</div>';
            }

            html += '<br>';

            for (j = 0; j < imageData.neutral.length; j++) {
                html += '<div style="background-color: ' + imageData.neutral[j].toCSS() + '">NEUTRAL</div>';
            }

            html += '</div>';

            $('#colors').html(html);
        }

    }, settings.interval); // For Fast Realtime-Preview

};

visualisation.programs.simpleBackground = function() {

    // set the scene size
    var WIDTH = 400,
      HEIGHT = 300;

    // set some camera attributes
    var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer();
    var camera =
      new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR);

    var scene = new THREE.Scene();

    // add the camera to the scene

    scene.add(camera);

    // the camera starts at 0,0,0
    // so pull it back
    camera.position.z = 300;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    $container.append(renderer.domElement);

};

///////////////////////
// Helper Functions  //
///////////////////////

// TODO: Color Palette Generation

// TODO: Color Change Interpolation
