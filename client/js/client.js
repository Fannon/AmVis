/* global net, io, MMCQ */
/* jshint jquery:true, devel:true */

/**
 * HTML5 Ambient Visualizer
 *
 * Uses Webcam to analyse current Colors of the envirionment
 * and generates matching WebGL Visualisations
 *
 * {@link http://gist.github.com/nrabinowitz/1104622} for Color Quantizing
 * {@link http://github.com/brehaut/color-js} for Color Management
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

    var msg = '<h1>Welcome to AmVis!</h1><h2>Waiting for Webcam Stream...</h2>';
    msg += '<p>(This program works just in a recent version of Google Chrome)</p>';
    amvis.vis.setHtmlOverlay(msg);

    // Get Webcam Stream starting
    amvis.enableWebcamStream(amvis.video, function() {
        // Start default Program when Webcam Ready
        amvis.vis.setHtmlOverlay('');
        amvis.vis.setProgram(amvis.settings.defaultProgram);
    });

    // Calculate Image Data if Webcam is available
    setInterval(function(){
        if (amvis.localMediaStream) {
            amvis.calculateImageData();
        }
    }, amvis.settings.visual.analyzerInterval);

    // Calculate MetaData from Image Data
    setInterval(function(){
        if (amvis.localMediaStream) {
            amvis.calculateMetaData();
        }
    }, amvis.settings.visual.interpolationInterval);

});
