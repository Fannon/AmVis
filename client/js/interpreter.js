/* global amvis, net, io, Color, MMCQ */
/* jshint jquery:true, devel:true */

/**
 * AmVis Interpreter
 * Takes the analyzed Metadata and interprets it
 *
 * @author Sebastian Huber
 */
amvis.interpretImageData = function() {
    "use strict";

    ////////////////////////////////
    // Set Image Motion Level     //
    ////////////////////////////////

    var ms = amvis.imageData.motionScore;

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

    if (dominantHsl.saturation < 0.2) {
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

/**
 * Calculates and interpolates Metadata from media input
 * (Uses calculated ImageData)
 */
amvis.calculateMetaData = function() {
    "use strict";

    // Calculate Image Metadata
    if (amvis.metaData.ready) {

        // Interpolate Dominant Color
        amvis.interpolateColor(amvis.metaData.image.raw.dominant, amvis.imageData.dominant);
        amvis.metaData.image.dominant = amvis.rgbToString(amvis.metaData.image.raw.dominant);

        // Interpolate Palette
        for (var i = 0; i < amvis.imageData.palette.length; i++) {
            amvis.interpolateColor(amvis.metaData.image.raw.palette[i], amvis.imageData.palette[i]);
            amvis.metaData.image.palette[i] = amvis.rgbToString(amvis.metaData.image.raw.palette[i]);
        }

        // Interpolate Analog Palette
        for (var j = 0; j < amvis.imageData.analog.length; j++) {
            amvis.interpolateColor(amvis.metaData.image.raw.analog[j], amvis.imageData.analog[j]);
            amvis.metaData.image.analog[j] = amvis.rgbToString(amvis.metaData.image.raw.analog[j]);
        }

        // Interpolate MotionScore
        amvis.metaData.image.motionScore = amvis.interpolateMotionScore(amvis.metaData.image.motionScore, amvis.imageData.motion_score);

    }

};
