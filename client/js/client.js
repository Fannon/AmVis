/* global net, io, MMCQ */
/* jshint jquery:true, devel:true */

/**
 * HTML5 Ambient Visualizer
 *
 * Uses Webcam to analyse current Colors of the envirionment
 * and generates matching WebGL Visualisations
 *
 * Uses {@link https://gist.github.com/nrabinowitz/1104622) for Color Quantizing
 * Uses {@link https://github.com/brehaut/color-js) for Color Management
 *
 * @author Simon Heimler
 * @author Sebastian Huber
 */
var amvis = {};

/////////////////////////
// Plugins             //
/////////////////////////

var Color = net.brehaut.Color;


/////////////////////////
// Initialization      //
/////////////////////////

jQuery(document).ready(function() {
    "use strict";

    // Disable Right Mouse Button Context Menu
    $(this).bind("contextmenu", function(e) {
        e.preventDefault();
    });

    // Get Webcam Stream starting
    amvis.enableWebcamStream(amvis.video);


    // TODO: Webworker

    // Calculate Image Data if Webcam is available
    setInterval(function(){
        if (amvis.localMediaStream) {
            amvis.calculateImageData(); // Async!
            //amvis.interpretImageData();
        }
    }, amvis.settings.visual.analyzerInterval);

    // Calculate MetaData from Image Data
    setInterval(function(){
        if (amvis.localMediaStream) {
            amvis.calculateMetaData();
        }
    }, amvis.settings.visual.interpolationInterval);


    // Start Visualisation Program
    amvis.vis.setProgram('simpleBackground');

});
