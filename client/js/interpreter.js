/* global amvis, net, io, Color, MMCQ */
/* jshint jquery:true, devel:true */

/**
 * AmVis Interpreter
 * Takes the analyzed Metadata and interprets it
 *
 *
 * @author Sebastian Huber
 */
amvis.interpretImageData = function() {
    "use strict";

    ////////////////////////////////
    // Set Image Motion Level     //
    ////////////////////////////////

    var ms = amvis.metaData.image.motionScore;

    if (ms >= 15) {
        amvis.metaData.image.motionLevel = 'fast';
    } else if (ms < 15 && ms >= 10) {
        amvis.metaData.image.motionLevel = 'medium';
    } else {
        amvis.metaData.image.motionLevel = 'slow';
    }

    ////////////////////////////////
    // Set Image Dominant Set     //
    ////////////////////////////////

    var dominantHsl = amvis.imageData.dominant.toHSV();
    var hue = dominantHsl.hue;

    if (dominantHsl.saturation < 0.3) {
        amvis.metaData.image.dominantSet = 'grey';
    } else if (hue <= 30){
        amvis.metaData.image.dominantSet = 'red';
    } else if (hue <= 90) {
        amvis.metaData.image.dominantSet = 'yellow';
    } else if (hue <= 150) {
        amvis.metaData.image.dominantSet = 'green';
    } else if (hue <= 210) {
        amvis.metaData.image.dominantSet = 'cyan';
    } else if (hue <= 270) {
        amvis.metaData.image.dominantSet = 'blue';
    } else if (hue <= 330) {
        amvis.metaData.image.dominantSet = 'magenta';
    } else if (hue <= 360) {
        amvis.metaData.image.dominantSet = 'red';
    }

};
