/* global amvis, THREE, THREEx, Stats, requestAnimationFrame, cancelAnimationFrame */
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
    $('#LogoContainer').html(img);
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
        $('#canvas').show();

        amvis.vis.programs.colorpalette.animate();
    },
    animate: function() {
        "use strict";
        var self = amvis.vis.programs.colorpalette;
        self.interval = setInterval(function(){

            if (amvis.metaData.ready) {
                var imageData = amvis.imageData;
                var html = '<div id="colordebug">';

                html += '<div style="background-color: #333">Motion Score: ' + amvis.metaData.image.motionScore + '</div>';
                html += '<div style="background-color: #333">MotionLevel: ' + amvis.metaData.image.motionLevel + '</div>';
                html += '<div style="background-color: #333">Dominant Set: ' + amvis.metaData.image.dominantSet + '</div><br>';

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

        var ambientLight	= new THREE.AmbientLight(0xffffff );
        c.scene.add(ambientLight);

        var directionalLight	= new THREE.DirectionalLight(0xffffff );
        directionalLight.position.set( Math.random(), Math.random(), Math.random() ).normalize();
        c.scene.add(directionalLight);

        var pointLight	= new THREE.PointLight(0xffffff );
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
                opacity: 0.1,
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
            particleGeometry.vertices.push(vector);
        }

//        var particleMaterials = [];
//        for (i = 0; i < TOTAL_MATERIALS; i++) {
//            particleMaterials.push(new THREE.ParticleBasicMaterial({
//                color: 0xFFFFFF,
//                size: Math.random() * PARTICLE_SIZE_VARIATION + PARTICLE_MINSIZE * 0.1,
//                opacity: 0.05,
////                sizeAttenuation: false,
//                transparent: true,
//                map: THREE.ImageUtils.loadTexture('img/particle.png')
//            }));
//        }

        var particleMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            opacity: 0.5,
            transparent: true,
            map: THREE.ImageUtils.loadTexture('img/particle2.png'),
            blending: 2
        });

//        var testMaterial = new THREE.ParticleCanvasMaterial();

        for (i = 0; i < TOTAL_PARTICLESYSTEMS; i++) {
//            var particles = new THREE.ParticleSystem(particleGeometry, particleMaterials[i % TOTAL_MATERIALS]);
            var particles = new THREE.ParticleSystem(particleGeometry, particleMaterial);
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
            geometryGroup[i].rotation.x += (amvis.metaData.image.motionScore * 0.01) * (i % 2 ? 1 : -1);
            geometryGroup[i].rotation.y += (amvis.metaData.image.motionScore * 0.01) * (i % 2 ? 1 : -1);
            if (amvis.metaData.ready) {
                geometryGroup[i].material.color = new THREE.Color(amvis.metaData.image.analog[3]);
            }
        }
        if (amvis.metaData.ready) {
            c.renderer.setClearColor(new THREE.Color(amvis.metaData.image.dominant));
        }


        // animation of all Particles
        var particleSystems = c.particleGroup.children;
        for(i = 0; i < particleSystems.length; i ++ ){
            particleSystems[i].rotation.y = PIseconds*0.00001 * (i % 2 ? 1 : -1);
            particleSystems[i].rotation.x = PIseconds*0.00001 * (i % 2 ? 1 : -1);
            if (amvis.metaData.ready) {
                particleSystems[i].material.color = new THREE.Color(amvis.metaData.image.analog[5]);
            }
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
        cancelAnimationFrame(self.animate);
        $('#VisContainer').html('');
    }
};


/**
 * Simple Background Program
 * Animation with the rendered colors of the video-input
 *
 * @author Sebastian Huber
 */
amvis.vis.programs.simpleBackground = {

    /** Wrapper Object which holds all Data/Modeldata releated to the Program */
    c: {},

    init: function() {
        "use strict";


        ///////////////////////////////
        // Basic Setup               //
        ///////////////////////////////

        amvis.vis.setImageOverlay('AmVisLogo1.png');

        var container = document.getElementById('VisContainer');
        var self = amvis.vis.programs.simpleBackground;
        var c = self.c;

        c.renderer = new THREE.WebGLRenderer({
            antialias : amvis.settings.advanced.antialias
        });
        c.renderer.setSize( window.innerWidth, window.innerHeight );
        c.renderer.setClearColor(new THREE.Color().setHex('0x333333'));
        container.appendChild(c.renderer.domElement);

        // add Stats.js - https://github.com/mrdoob/stats.js
        c.stats = new Stats();
        c.stats.domElement.style.position   = 'absolute';
        c.stats.domElement.style.bottom = '0px';
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

        //var ambientLight = new THREE.AmbientLight(0xffffff );
        //c.scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff );
        directionalLight.position.set( Math.random(), Math.random(), Math.random() ).normalize();
        c.scene.add(directionalLight);

        //var pointLight = new THREE.PointLight(0xffffff );
        //pointLight.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
        //    .normalize().multiplyScalar(1.2);
        //c.scene.add(pointLight);


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

            var newMesh = new THREE.Mesh(geometry, material);

            c.geometryGroup.add(newMesh);
        }
        c.scene.add(c.geometryGroup);


        ///////////////////////////////
        // Scene Particles           //
        ///////////////////////////////

        var TOTAL_PARTICLES = 100;
        var TOTAL_MATERIALS = 5;
        var TOTAL_PARTICLESYSTEMS = 50;

        c.particleGroup = new THREE.Object3D();

        var particleGeometry = new THREE.Geometry();

        for (i = 0; i < TOTAL_PARTICLES; i++) {
            var vector = new THREE.Vector3(
                (Math.random() * 2 - 1) * 5,
                (Math.random() * 2 - 1) * 5,
                (Math.random() * 2 - 1) * 10
            );
            particleGeometry.vertices.push(vector);
        }

        var particleMaterial = new THREE.ParticleBasicMaterial({
            //color: 0xFFFFFF,
            size: 0.2,
            opacity: 0.5,
            transparent: true,
            map: THREE.ImageUtils.loadTexture('img/particle3.png'),
            blending: 2
        });


        for (i = 0; i < TOTAL_PARTICLESYSTEMS; i++) {
            var particles = new THREE.ParticleSystem(particleGeometry, particleMaterial);
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

        var self = amvis.vis.programs.simpleBackground;
        var c = self.c;

        // variable which is increase by Math.PI every seconds - usefull for animation
        var PIseconds = Date.now() * Math.PI;

        var geometryGroup = c.geometryGroup.children;

        // animation of all objects
        for(var i = 0; i < geometryGroup.length; i ++ ){
            geometryGroup[i].rotation.y = PIseconds*0.0001 * (i % 2 ? 1 : -1);
            geometryGroup[i].rotation.x = PIseconds*0.00005 * (i % 2 ? 1 : -1);
            geometryGroup[i].rotation.x += (amvis.metaData.image.motionScore * 0.01) * (i % 2 ? 1 : -1);
            geometryGroup[i].rotation.y += (amvis.metaData.image.motionScore * 0.01) * (i % 2 ? 1 : -1);
            if (amvis.metaData.ready) {
                geometryGroup[i].material.color = new THREE.Color(amvis.metaData.image.analog[3]);
            }
        }
        if (amvis.metaData.ready) {
            c.renderer.setClearColor(new THREE.Color(amvis.metaData.image.dominant));
        }


        // animation of all Particles
        var particleSystems = c.particleGroup.children;
        for(i = 0; i < particleSystems.length; i ++ ){
            particleSystems[i].rotation.y = PIseconds*0.00001 * (i % 2 ? 1 : -1);
            particleSystems[i].rotation.x = PIseconds*0.00001 * (i % 2 ? 1 : -1);
            if (amvis.metaData.ready) {
                particleSystems[i].material.color = new THREE.Color(amvis.metaData.image.analog[5]);
            }
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
        var self = amvis.vis.programs.simpleBackground;

        self.c = {}; // Clears Container Object with every Data in it.
        amvis.vis.running = false;
        cancelAnimationFrame(self.animate);
        $('#VisContainer').html('');
    }
};

///////////////////////
// Helper Functions  //
///////////////////////
