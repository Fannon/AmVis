/* global amvis, THREE, THREEx, Stats, requestAnimationFrame */
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
amvis.vis.running = false;


////////////////////////////
// Visualisation Handling //
////////////////////////////

/**
 * Set current Program
 *
 * TODO: Fade In
 *
 * @param  program
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
    stop: function() {
        "use strict";
        var self = amvis.vis.programs.colorpalette;
        $('#video').hide();
        amvis.vis.setHtmlOverlay('');
        clearInterval(self.interval);
    }
};

/**
 * Simon's Experimental Sandbox
 *
 * @author Simon Heimler
 */
amvis.vis.programs.experimental = {

    /** Wrapper Object which holds all Data/Modeldata releated to the Program */
    c: {},

    init: function() {
        "use strict";


        ///////////////////////////////
        // Basic Setup               //
        ///////////////////////////////

        var container = document.getElementById('VisContainer');
        var self = amvis.vis.programs.experimental;
        var c = self.c;

        c.renderer = new THREE.WebGLRenderer({
            antialias : amvis.settings.advanced.antialias
        });
        c.renderer.setSize( window.innerWidth, window.innerHeight );
        c.renderer.setClearColor(new THREE.Color().setHex('0x2A2090'));
        container.appendChild(c.renderer.domElement);

        // add Stats.js - https://github.com/mrdoob/stats.js
        c.stats = new Stats();
        c.stats.domElement.style.position	= 'absolute';
        c.stats.domElement.style.bottom	= '0px';
        container.appendChild(c.stats.domElement );


        ///////////////////////////////
        // Scene Setup               //
        ///////////////////////////////

        c.scene = new THREE.Scene();
        c.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
        c.camera.position.set(0,0,5);
        c.scene.add(c.camera);
        THREEx.WindowResize.bind(c.renderer, c.camera);


        ///////////////////////////////
        // Scene Lights            //
        ///////////////////////////////

        var ambientLight	= new THREE.AmbientLight( Math.random() * 0xffffff );
        c.scene.add(ambientLight);

        var directionalLight	= new THREE.DirectionalLight( Math.random() * 0xffffff );
        directionalLight.position.set( Math.random(), Math.random(), Math.random() ).normalize();
        c.scene.add(directionalLight);

        var pointLight	= new THREE.PointLight( Math.random() * 0xffffff );
        pointLight.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
            .normalize().multiplyScalar(1.2);
        c.scene.add(pointLight);


        ///////////////////////////////
        // Scene Geometry            //
        ///////////////////////////////

        c.geometryGroup = new THREE.Object3D();

        for (var i = 0; i < 7; i++) {

            var size = Math.random()*5+2;
            // var geometry    = new THREE.CubeGeometry(size, size, size);
            var geometry = new THREE.OctahedronGeometry(size/2);
            // var geometry = new THREE.SphereGeometry(size/2, 7, 7)
            var material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHex('0x9D1515'),
                opacity: 0.2,
                transparent: true
            });
//            var material    = new THREE.MeshLambertMaterial({ambient: 0x808080, color: Math.random() * 0xffffff, opacity: 0.5});
//            var material    = new THREE.MeshPhongMaterial({ambient: '#AE81FF', color: '#4D3388', opacity: 0.05});
//            var material = new THREE.MeshPhongMaterial({
//                ambient: new THREE.Color().setHex('0x6A2374'),
//                color: new THREE.Color().setHex('0x050505'),
//                specular: new THREE.Color().setHex('0xffffff'),
//                shininess: 30,
//                opacity: 0.1,
//                transparent: true
////                wireframe: true
//            });
            var newMesh    = new THREE.Mesh(geometry, material);

            c.geometryGroup.add(newMesh);
        }
        c.scene.add(c.geometryGroup);


        ///////////////////////////////
        // Scene Particles           //
        ///////////////////////////////

        var TOTAL_PARTICLES = 100;
        var TOTAL_MATERIALS = 5;
        var TOTAL_PARTICLESYSTEMS = 20;

        var PARTICLE_MINSIZE = 0;
        var PARTICLE_SIZE_VARIATION = 3;

        c.particleGroup = new THREE.Object3D();

        var particleGeometry = new THREE.Geometry();

        for (i = 0; i < TOTAL_PARTICLES; i++) {
            var vector = new THREE.Vector3(
                (Math.random() * 2 - 1) * 5,
                (Math.random() * 2 - 1) * 5,
                (Math.random() * 2 - 1) * 5
            );
            particleGeometry.vertices.push(new THREE.Vertex(vector));
        }

        var particleMaterials = [];
        for (i = 0; i < TOTAL_MATERIALS; i++) {
            particleMaterials.push(new THREE.ParticleBasicMaterial({
                color: 0xFFFFFF,
                size: Math.random() * PARTICLE_SIZE_VARIATION + PARTICLE_MINSIZE,
                sizeAttenuation: false
            }));
        }

        for (i = 0; i < TOTAL_PARTICLESYSTEMS; i++) {
            var particles = new THREE.ParticleSystem(particleGeometry, particleMaterials[i % TOTAL_MATERIALS]);
            particles.rotation.y = i / (Math.PI * 2);
            c.particleGroup.add(particles);
        }

        c.scene.add(c.particleGroup);



        ///////////////////////////////
        // Start Animation           //
        ///////////////////////////////

        amvis.vis.running = true;
        this.animate();

    },
    animate: function() {
        "use strict";

        var self = amvis.vis.programs.experimental;
        var c = self.c;

        // variable which is increase by Math.PI every seconds - usefull for animation
        var PIseconds	= Date.now() * Math.PI;

        var geometryGroup = c.geometryGroup.children;

        // animation of all objects
        for(var i = 0; i < geometryGroup.length; i ++ ){
            geometryGroup[i].rotation.y = PIseconds*0.0001 * (i % 2 ? 1 : -1);
            geometryGroup[i].rotation.x = PIseconds*0.00005 * (i % 2 ? 1 : -1);
        }

        // animation of all Particles
        var particleSystems = c.particleGroup.children;
        for(i = 0; i < particleSystems.length; i ++ ){
            particleSystems[i].rotation.y = PIseconds*0.00001 * (i % 2 ? 1 : -1);
            particleSystems[i].rotation.x = PIseconds*0.00001 * (i % 2 ? 1 : -1);
        }

        // Get new Animation Frame and render it
        if (amvis.vis.running) {
            requestAnimationFrame(self.animate);
        }
        c.renderer.render(c.scene, c.camera );
        c.stats.update();

    },
    stop: function() {
        "use strict";
        var self = amvis.vis.programs.experimental;

        self.c = {}; // Clears Container Object with every Data in it.
        amvis.vis.running = false;
        $('#VisContainer').html('');
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
