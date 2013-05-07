/* global amvis, net, io, Color, MMCQ */
/* jshint jquery:true, devel:true */

/**
 * AmVis Analyzer
 * Takes Input Data (like Webcam) and analyzes it to generate useful MetaData for the Visualisation
 *
 * @author Simon Heimler
 */


/////////////////////////
// Variables           //
/////////////////////////

amvis.video = document.querySelector("#video");
amvis.canvas = document.querySelector('#canvas');
amvis.localMediaStream = null;
amvis.ctx = amvis.canvas.getContext('2d');
amvis.cw = amvis.canvas.width;
amvis.ch = amvis.canvas.height;
amvis.totalPixels = amvis.cw * amvis.ch;

amvis.connected = false;
amvis.pixelArchive = null;
amvis.remoteInformations = {};

amvis.metaData = {
    ready: false,
    image: {
        raw: {
            dominant: [0, 0, 0],
            palette: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
            analog: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]
        },
        palette: [],
        analog: [],
        motionScore: 0
    }
};

amvis.imageData = {};

/////////////////////////
// Processing Stream   //
/////////////////////////

/**
 * Calculates and interpolates Metadata from media input
 *
 * TODO: Interpolation between Frames!
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

    } else {
        amvis.cameraFail({message:'No Webcam Stream!'});
    }

};


///////////////////////
// Calculate Data    //
///////////////////////

/**
 * Calculates the imageData Object which contains Color Informations about the current Frame
 *
 * Uses quantize.js Copyright 2008 Nick Rabinowitz.
 *
 * @return {object}                           Object with Color Informations
 */
amvis.calculateImageData = function() {
    "use strict";

    ////////////////////////////////
    // Get Pixeldata              //
    ////////////////////////////////

    // draw image according to canvas width and height
    amvis.ctx.drawImage(amvis.video, 0, 0, amvis.cw, amvis.ch);

    // Get Image Metadata
    var pixels = amvis.ctx.getImageData(0, 0, amvis.cw, amvis.ch).data; // Gets Pixeldata from Image

    if (!amvis.pixelArchive) {
        amvis.pixelArchive = pixels;
    }

    amvis.imageData.palette = [];
    var pixelArray = [];
    var dominantColor;
    var motionScore = 0;

    // Looping over Pixel Array, takes 4 steps (rgba) with each iteration
    // while loop with i and n cached: http://jsperf.com/fors-vs-while/58
    var i = 0;
    var n = pixels.length;
    while (i < n) {

        var r = pixels[i];
        var g = pixels[i+1];
        var b = pixels[i+2];
        // Alpha (pixels[i+3]) is ignored

        // Put every interesting Pixel into the pixelArray which will be quantized for calculating the Color Palette
        if(!(r > amvis.settings.visual.maxBrightness && g > amvis.settings.visual.maxBrightness && b > amvis.settings.visual.maxBrightness) &&
            r > amvis.settings.visual.minBrightness && g > amvis.settings.visual.minBrightness && b > amvis.settings.visual.minBrightness) {
            pixelArray.push([r,g,b]);
        }

        // Calculate Motion Score
        var motionDiff = Math.abs(amvis.pixelArchive[i] - r) + Math.abs(amvis.pixelArchive[i+1] - g) + Math.abs(amvis.pixelArchive[i+2] - b);
        motionScore += motionDiff/3;

        i += 4;
    }

    amvis.pixelArchive = pixels;
    amvis.imageData.motion_score = Math.round((motionScore / amvis.totalPixels) * 100) / 100;
    amvis.remoteInformations.motionScore = amvis.imageData.motion_score;


    ////////////////////////////////
    // Calculate Main Palette     //
    ////////////////////////////////

    // Send array to quantize function which clusters values using median cut algorithm
    var cmap = MMCQ.quantize(pixelArray, 5);
    var palette = cmap.palette();

    // Convert RGB Arrays to Color Objects
    amvis.imageData.palette[0] = Color(palette[0]);
    amvis.imageData.palette[1] = Color(palette[1]);
    amvis.imageData.palette[2] = Color(palette[2]);
    amvis.imageData.palette[3] = Color(palette[3]);
    amvis.imageData.palette[4] = Color(palette[4]);


    ////////////////////////////////
    // Calculate Dominant Color   //
    ////////////////////////////////

    dominantColor = palette[0];

    // Using a "Diff Score" to guess which Color is most interesting
    // Also this takes care of too greyish colors that produce very boring palettes
    if (amvis.settings.minColorfulness !== 0) {
        for (var j = 0; j < palette.length; j++) {

            var diff = 0;
            diff += Math.abs(palette[j][0] - palette[j][1]);
            diff += Math.abs(palette[j][0] - palette[j][2]);
            diff += Math.abs(palette[j][1] - palette[j][2]);

            if (diff > amvis.settings.minColorfulness) {
                dominantColor = palette[j];
                break;
            }
        }
    }

    // PostProcessing Color
    var finalDominantColor = Color(dominantColor);

    // Add / Remove Saturation if setting not 0
    if (amvis.settings.visual.saturation > 0) {
        finalDominantColor = finalDominantColor.saturateByRatio(amvis.settings.visual.saturation);
    } else if (amvis.settings.visual.saturation < 0) {
        finalDominantColor = finalDominantColor.desaturateByRatio(-amvis.settings.visual.saturation);
    }

    // Shift the hue if not 0
    if (amvis.settings.visual.shiftHue > 0) {
        finalDominantColor = finalDominantColor.shiftHue(amvis.settings.visual.shiftHue);
    }

    amvis.remoteInformations.dominantColor = finalDominantColor.toCSS();
    amvis.imageData.dominant = finalDominantColor;


    ////////////////////////////////
    // Additional Color Palettes  //
    ////////////////////////////////

    var listOfdegrees = [-2 * amvis.settings.visual.analogAngle, -amvis.settings.visual.analogAngle, 0, amvis.settings.visual.analogAngle, 2*amvis.settings.visual.analogAngle];
    var analog = finalDominantColor.schemeFromDegrees(listOfdegrees);

    // Convert to RGB Color Objects
    for (var k = 0; k < analog.length; k++) {
        analog[k] = analog[k].toRGB();
    }

    amvis.imageData.analog = analog;

    if (amvis.connected) {
        amvis.socket.emit('remote_informations', amvis.remoteInformations);
    }

    amvis.metaData.ready = true;

};


///////////////////////
// Helper Functions  //
///////////////////////

/**
 * Cross Browser Shim for HTML5 Webcam Input
 * http://wolframhempel.com/2012/11/27/getusermedia-cross-browser-shim/
 *
 * TODO: Not working very well
 *
 * @param  {[type]} videoDomElement [description]
 * @return {[type]}                 [description]
 */
amvis.enableWebcamStream = function(videoDomElement) {
    "use strict";

    videoDomElement.autoplay = true;

    var getUserMedia = (
        navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.oGetUserMedia ||
            navigator.msieGetUserMedia ||
            false
        );

    var onStream = function( stream ) {

        try {
            /**
             * Chrome / Opera
             */
            videoDomElement.src = ( window.URL || window.webkitURL ).createObjectURL( stream );
            amvis.localMediaStream = stream;
        } catch( e ) {
            /**
             * Firefox
             */
            if(videoDomElement.srcObject ) {
                videoDomElement.srcObject = stream;
                amvis.localMediaStream = stream;
            } else {
                videoDomElement.mozSrcObject = stream;
                amvis.localMediaStream = stream;
            }
            videoDomElement.play();
        }
    };

    var onError = function( error ) {
        amvis.cameraFail(error);
    };

    if(getUserMedia) {
        getUserMedia.call( navigator, amvis.settings.advanced.webcamoptions, onStream, onError );
    }
};

/**
 * On Camera Failure
 *
 * @param  {object} e Error Description / Object
 */
amvis.cameraFail = function (e) {
    "use strict";
    console.log('Camera Fail / Not ready: ', e);
};
/**
 * Interpolates Colors
 *
 * Slowly adjusts current Color (RGB Array) with new Color (Color Object) from imageData
 *
 * @param currentColor {array}
 * @param newColor
 */
amvis.interpolateColor = function(currentColor, newColor) {
    "use strict";
    currentColor[0] = (newColor.red * 255 * amvis.settings.visual.interpolationRate) + (currentColor[0] * (1 - amvis.settings.visual.interpolationRate));
    currentColor[1] = (newColor.green * 255 * amvis.settings.visual.interpolationRate) + (currentColor[1] * (1 - amvis.settings.visual.interpolationRate));
    currentColor[2] = (newColor.blue * 255 * amvis.settings.visual.interpolationRate) + (currentColor[2] * (1 - amvis.settings.visual.interpolationRate));
};

/**
 * Interpolates the MotionScore
 *
 * @param currentMotionScore
 * @param newMotionScore
 * @returns {number}
 */
amvis.interpolateMotionScore = function(currentMotionScore, newMotionScore) {
    "use strict";
    if (newMotionScore > 0) {
        currentMotionScore = (newMotionScore * amvis.settings.visual.interpolationRate) + (currentMotionScore * (1 - amvis.settings.visual.interpolationRate));
    }
    return currentMotionScore;
};

/**
 * Converts RGB Array to CSS friendly String
 *
 * @param  {array} rgbArray
 * @return {string}
 */
amvis.rgbToString = function(rgbArray) {
    "use strict";
    return 'rgb(' + Math.floor(rgbArray[0]) + ', ' + Math.floor(rgbArray[1]) + ', ' + Math.floor(rgbArray[2]) + ')';
};
