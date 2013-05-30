/* global amvis, net, io, Color, MMCQ */
/* jshint jquery:true, devel:true */

/**
 * AmVis Analyzer
 * Takes Input Data (like Webcam) and analyzes it to generate useful MetaData for the Visualisation
 *
 * TODO: Multithreading WebWorker
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
amvis.pixelArchive = [[0, 0, 0]];
amvis.remoteInformations = {};
amvis.palette = [];

amvis.metaData = {
    ready: false,
    image: {
        raw: {
            dominant: [0, 0, 0],
            palette: [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ],
            analog: [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ]
        },
        palette: [],
        dominantSet: undefined,
        analog: [],
        motionScore: 0,
        motionLevel: undefined
    }
};

amvis.imageData = {};


///////////////////////
// Calculate Data    //
///////////////////////

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

/**
 * Calculates the imageData Object which contains Color Informations about the current Frame
 *
 * Uses quantize.js Copyright 2008 Nick Rabinowitz.
 */
amvis.calculateImageData = function() {
    "use strict";

    ////////////////////////////////
    // Variables                  //
    ////////////////////////////////

    var dominantColor;
    var pixelArray = [];
    var motionScore = 0;
    amvis.imageData.palette = [];


    ////////////////////////////////
    // Get Pixeldata              //
    ////////////////////////////////

    // draw image according to canvas width and height
    amvis.ctx.drawImage(amvis.video, 0, 0, amvis.cw, amvis.ch);

    // Get Image Metadata
    var pixels = amvis.ctx.getImageData(0, 0, amvis.cw, amvis.ch).data; // Gets Pixeldata from Image

    // If there is no pixelArchive yet, fill it with current PixelArray
    if (!amvis.pixelArchive) {
        amvis.pixelArchive = pixels;
    }

    ////////////////////////////////
    // Pre-Calculations           //
    ////////////////////////////////

    // Looping over Pixel Array, takes 4 steps (rgba) with each iteration
    // while loop with i and n cached: http://jsperf.com/fors-vs-while/58

    var i = 0;

    while(i < pixels.length) {

        var r = pixels[i];
        var g = pixels[i + 1];
        var b = pixels[i + 2];
        // Alpha (pixels[i+3]) is ignored

        // Put every interesting Pixel into the pixelArray which will be quantized for calculating the Color Palette
        if (!(r > amvis.settings.visual.maxBrightness && g > amvis.settings.visual.maxBrightness && b > amvis.settings.visual.maxBrightness) &&
            r > amvis.settings.visual.minBrightness && g > amvis.settings.visual.minBrightness && b > amvis.settings.visual.minBrightness) {
            pixelArray.push([r, g, b]);
        }

        // Calculate Motion Score
        var motionDiff = Math.abs(amvis.pixelArchive[i] - r) + Math.abs(amvis.pixelArchive[i + 1] - g) + Math.abs(amvis.pixelArchive[i + 2] - b);
        motionScore += motionDiff / 3;

        i += 4;
    }

    amvis.pixelArchive = pixels;
    amvis.imageData.motion_score = Math.round((motionScore / amvis.totalPixels) * 100 * amvis.settings.visual.motionScoreDegree) / 100;
    amvis.remoteInformations.motionScore = amvis.imageData.motion_score;


    ////////////////////////////////
    // Calculate Main Palette     //
    ////////////////////////////////

    // Send array to quantize function which clusters values using median cut algorithm
    if (pixelArray.length > 0) {
        var cmap = MMCQ.quantize(pixelArray, 5);
        var paletteTemp = cmap.palette();
        if (paletteTemp && paletteTemp.length > 0) {
            amvis.palette = paletteTemp;
        } else {
            console.log('Error in Quantizer!');
        }
    } else {
        console.log('No Pixeldata left to analyze');
    }


    ////////////////////////////////
    // Analyzer Worker            //
    // Deactivated                //
    ////////////////////////////////

//    var analyzerWorker = new Worker('js/analyzerWorker.js');

    /**
     * Register 'On Worker done' Event Listener
     * @event
     */
//    analyzerWorker.addEventListener('message', function(e) {
//
//    }, false);

    /**
     * Send Job to Worker
     */
//    analyzerWorker.postMessage({
//        pixels: pixels
//    });


    ////////////////////////////////
    // Process Data from Worker   //
    ////////////////////////////////

    // Convert RGB Arrays to Color Objects
    amvis.imageData.palette[0] = new Color(amvis.palette[0]);
    amvis.imageData.palette[1] = new Color(amvis.palette[1]);
    amvis.imageData.palette[2] = new Color(amvis.palette[2]);
    amvis.imageData.palette[3] = new Color(amvis.palette[3]);
    amvis.imageData.palette[4] = new Color(amvis.palette[4]);


    /////////////////////////////////////
    // Calculate Dominant Color        //
    /////////////////////////////////////

    dominantColor = amvis.palette[0];

    // Using a "Diff Score" to guess which Color is most interesting
    // Also this takes care of too greyish colors that produce very boring palettes
    if (amvis.settings.minColorfulness !== 0) {
        for (var j = 0; j < amvis.palette.length; j++) {

            var diff = 0;
            diff += Math.abs(amvis.palette[j][0] - amvis.palette[j][1]);
            diff += Math.abs(amvis.palette[j][0] - amvis.palette[j][2]);
            diff += Math.abs(amvis.palette[j][1] - amvis.palette[j][2]);

            if (diff > amvis.settings.minColorfulness) {
                dominantColor = amvis.palette[j];
                break;
            }
        }
    }

    /////////////////////////////////////
    // PostProcessing Dominant Color   //
    /////////////////////////////////////

    var finalDominantColor = new Color(dominantColor);

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


    /////////////////////////////////////
    // Additional Color Palettes       //
    /////////////////////////////////////

    var listOfdegrees = [-2 * amvis.settings.visual.analogAngle, -amvis.settings.visual.analogAngle, 0, amvis.settings.visual.analogAngle, 2 * amvis.settings.visual.analogAngle];
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

    amvis.interpretImageData();

};


///////////////////////
// Helper Functions  //
///////////////////////

/**
 * Cross Browser Shim for HTML5 Webcam Input
 * http://wolframhempel.com/2012/11/27/getusermedia-cross-browser-shim/
 *
 * Works just in Google Chrome!
 *
 * @param {Object}      videoDomElement DOM Element of Video
 * @param {Function}    callback        Callback Function, will be executed when Webcam ready
 */
amvis.enableWebcamStream = function(videoDomElement, callback) {
    "use strict";

    videoDomElement.autoplay = true;

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;


    var onStream = function(stream) {

        // Set the source of the video element with the stream from the camera
        if (stream.mozSrcObject !== undefined) {
            stream.mozSrcObject = stream;
        } else {
            amvis.video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }

        try {
            videoDomElement.src = ( window.URL || window.webkitURL ).createObjectURL(stream);
            amvis.localMediaStream = stream;
            callback();
        } catch (e) {
            onError('This Browser is not supported, Sorry!');
        }

    };

    var onError = function(error) {
        amvis.cameraFail(error);
    };

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true}, onStream, onError);
    } else {
        onError('Native web camera streaming (getUserMedia) not supported in this browser.');
    }

};

/**
 * On Camera Failure
 *
 * @param  {object} e Error Description / Object
 */
amvis.cameraFail = function(e) {
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
 * Interpolates MotionScore
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
    return 'rgb(' + Math.floor(rgbArray[0]) + ',' + Math.floor(rgbArray[1]) + ',' + Math.floor(rgbArray[2]) + ')';
};
