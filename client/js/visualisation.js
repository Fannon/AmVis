/* global amvis, THREE */
/* jshint jquery:true, devel:true */

/**
 * AmVis Visualisation Rendering
 * Generates Visualisations via Three.js based on the analyzed MetaInformation
 *
 * @author Sebastian Huber
 * @author Simon Heimler
 */

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
 * @param {String} program
 */
amvis.vis.setProgram = function(program) {
    "use strict";

        if (amvis.settings.programs.indexOf(program) >= 0) {

        // Stop current Program
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
    if (amvis.vis.currentProgram) {
        amvis.vis.programs[amvis.vis.currentProgram].stop();
    }
};

/**
 * Sets an Image Overlay (Logo etc.)
 * @param {string} imageName
 */
amvis.vis.setImageOverlay = function(imageName) {
    "use strict";
    var img = $('<img id="overlayImage">');
    img.attr('src', 'img/' + imageName);
    $('#imageOveray').html(img);
};

/**
 * Sets HTML Overlay (Text etc.)
 *
 * @param {string} html
 */
amvis.vis.setHtmlOverlay = function(html) {
    "use strict";
    // TODO: Add Image to Overlay
    $('#HtmlContainer').html(html);
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
amvis.vis.programs.colorpalette = {

    init: function() {
        "use strict";
        // Show Webcam Input Video
        $('#video').show();

        amvis.vis.programs.colorpalette.animate();
    },
    animate: function() {
        "use strict";
        var self = amvis.vis.programs.colorpalette;
        self.interval = setInterval(function(){

            if (amvis.metaData.ready) {
                var imageData = amvis.imageData;
                var html = '<div id="colordebug">';

                html += '<div style="background-color: #000">Motion Score: ' + amvis.metaData.image.motionScore + '</div><br>';

                html += '<div style="background-color: ' + imageData.dominant.toCSS() + '">DOMINANT CURRENT</div><br>';

                html += '<div style="background-color: ' + amvis.metaData.image.dominant + '">DOMINANT INTERPOLATED</div><br>';

                for (var j = 0; j < imageData.palette.length; j++) {
                    html += '<div style="background-color: ' + amvis.metaData.image.palette[j] + '">PALETTE</div>';
                }

                html += '<br>';

                for (j = 0; j < imageData.analog.length; j++) {
                    html += '<div style="background-color: ' + amvis.metaData.image.analog[j] + '">ANALOG</div>';
                }

                html += '<br></div>';

                amvis.vis.setHtmlOverlay(html);
            }

        }, amvis.settings.visual.interpolationInterval); // For Fast Realtime-Preview
    },
    render: function() {
        "use strict";

    },
    stop: function() {
        "use strict";
        var self = amvis.vis.programs.colorpalette;
        $('#video').hide();
        amvis.vis.setHtmlOverlay('');
        clearInterval(self.interval);
    }
};


/**
 * Simple Background Program
 * Analysiert die aktuellen Farben und gibt dazu passende Farbpaletten und -informationen aus
 *
 * @author Sebastian Huber
 */
amvis.vis.programs.simpleBackground = {
    VIEW_ANGLE: 45,
    stop: function() {
        "use strict";
        $('#VisContainer').html('');
    }
};

amvis.vis.programs.simpleBackground.init = function() {
    "use strict";
    console.log('simpleBackground.init();');
//    var self = amvis.vis.programs.simpleBackground;

//    var metaDataObject = amvis.getMetaData();



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
    var $container = $('#VisContainer');

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
};

amvis.vis.programs.simpleBackground.render = function() {
    "use strict";

};

///////////////////////
// Helper Functions  //
///////////////////////
