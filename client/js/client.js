/* global net, io, MMCQ */
/* jshint jquery:true, devel:true */

/**
 * HTML5 Ambient Visualizer
 *
 * Uses Webcam to analyse current Colors of the envirionment
 * and generates matching WebGL Visualisations
 *
 * Uses https://gist.github.com/nrabinowitz/1104622 for Color Quantizing
 * Uses https://github.com/brehaut/color-js for Color Management
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

    // Get Webcam Stream starting
    amvis.enableWebcamStream(amvis.video);
    // Start Visualisation Program
    amvis.vis.setProgram('simpleBackground');

});
