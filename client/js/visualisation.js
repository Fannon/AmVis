/* global amvis */
/* jshint jquery:true, devel:true */

/////////////////////////
// Variables           //
/////////////////////////

/** Visualisation Namespace */
amvis.vis = {};
/** Visualisation Programs Namespace */
amvis.vis.programs = {};


////////////////////////////
// Visualisation Handling //
////////////////////////////

/**
 * Set current Program
 *
 * TODO: Fade In
 *
 * @param {string} program
 */
amvis.vis.setProgram = function(program) {
    "use strict";

    if (amvis.settings.programs.indexOf(program) >= 0) {
        amvis.vis.stopCurrentProgram();

        // Start new Program
        amvis.vis.currentProgram = program;
        amvis.vis.programs[program].init();
    } else {
        console.log('Program not allowed/found');
    }

};

/**
 * Stops currently running Program
 * TODO: Fade to black
 */
amvis.vis.stopCurrentProgram = function() {
    "use strict";
    // TODO: Stop current Program
};

/**
 * Sets an Image Overlay (Logo etc.)
 * @param {string} imageName
 */
amvis.vis.setImageOverlay = function(imageName) {
    "use strict";
    // TODO: Add Image to Overlay
    $('#imageOveray').html();
};

/**
 * Sets HTML Overlay (Text etc.)
 *
 * @param {string} html
 */
amvis.vis.setHtmlOverlay = function(html) {
    "use strict";
    // TODO: Add Image to Overlay
    $('#imageOveray').html();
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
amvis.vis.programs.colorpalette = {};
amvis.vis.programs.colorpalette.init = function() {
    "use strict";

    // TODO: Rewrite this to work with ThreeJS or with amvis.vis.setHtmlOverlay();

    setInterval(function(){
        var metaDataObject = amvis.getMetaData();
        // console.log(metaDataObject);

        if (metaDataObject) {
            var imageData = metaDataObject.image;
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

    }, amvis.settings.visual.interval); // For Fast Realtime-Preview

};


/**
 * Simple Background Program
 * Analysiert die aktuellen Farben und gibt dazu passende Farbpaletten und -informationen aus
 *
 * @author Sebastian Huber
 */
amvis.vis.programs.simpleBackground = {
    VIEW_ANGLE: 45
};

amvis.vis.programs.simpleBackground.init = function() {
    "use strict";
    console.log('simpleBackground.init();');
    var self = amvis.vis.programs.simpleBackground;

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
    var camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
                                    ASPECT,
                                    NEAR,
                                    FAR  );
    var scene = new THREE.Scene();

    // the camera starts at 0,0,0 so pull it back
    camera.position.z = 300;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    $container.append(renderer.domElement);

    // create the sphere's material
    var sphereMaterial = new THREE.MeshLambertMaterial(
    {
        color: 0xCC0000
    });

    // set up the sphere vars
    var radius = 50, segments = 16, rings = 16;

    // create a new mesh with sphere geometry -
    // we will cover the sphereMaterial next!
    var sphere = new THREE.Mesh(
       new THREE.SphereGeometry(radius, segments, rings),
       sphereMaterial);

    // add the sphere to the scene
    scene.add(sphere);

    // and the camera
    scene.add(camera);

    // create a point light
    var pointLight = new THREE.PointLight( 0xFFFFFF );

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);

    // draw!
    renderer.render(scene, camera);

    /**
     * Assume we have jQuery to hand
     * and pull out from the DOM the
     * two snippets of text for
     * each of our shaders
     */
    var vShader = $('#vertexshader');
    console.log(vShader.text());
    var fShader = $('#fragmentshader');
    var shaderMaterial =
      new THREE.ShaderMaterial({
        vertexShader:   vShader.text(),
        fragmentShader: fShader.text()
      });

};

amvis.vis.programs.simpleBackground.animate = function() {
    "use strict";
    var self = amvis.vis.programs.simpleBackground;
    self.metaDataObject = amvis.getMetaData();
};

amvis.vis.programs.simpleBackground.render = function() {
    "use strict";

};

///////////////////////
// Helper Functions  //
///////////////////////

// TODO: Color Palette Generation

// TODO: Color Change Interpolation
