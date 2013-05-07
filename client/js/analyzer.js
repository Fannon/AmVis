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

amvis.metaData = {};

amvis.imageData = {};
amvis.imageDataArchive = {};

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
    if (amvis.localMediaStream) {

        var diffRatio = 1 / (amvis.settings.visual.analyzerInterval / amvis.settings.visual.interpolationInterval);

        amvis.metaData.image = {};

        var dominantColor = {
            red: 0,
            green: 0,
            blue: 0
        };

        if (!amvis.metaData.image.dominant) {
            amvis.metaData.image.dominant = dominantColor;
        }

        dominantColor.red = ((amvis.imageData.dominant.red * diffRatio) + (amvis.metaData.image.dominant.red * (1 - diffRatio)) / 2) * 255;
        dominantColor.green = ((amvis.imageData.dominant.green * diffRatio) + (amvis.metaData.image.dominant.green * (1 - diffRatio)) / 2) *255;
        dominantColor.blue = ((amvis.imageData.dominant.blue * diffRatio) + (amvis.metaData.image.dominant.blue * (1 - diffRatio)) / 2) * 255;

        amvis.metaData.image.dominant = dominantColor;

//        console.log(dominantColor);

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
    var imageDatapalette = [];
    imageDatapalette[0] = Color(palette[0]);
    imageDatapalette[1] = Color(palette[1]);
    imageDatapalette[2] = Color(palette[2]);
    imageDatapalette[3] = Color(palette[3]);
    imageDatapalette[4] = Color(palette[4]);


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

    // TODO: Write generic Function which returns Colorpalettes (?)

    var analog = finalDominantColor.analogousScheme();

    var neutral = finalDominantColor.neutralScheme();

    var listOfdegrees = [-2 * amvis.settings.visual.analogAngle, -amvis.settings.visual.analogAngle, 0, amvis.settings.visual.analogAngle, 2*amvis.settings.visual.analogAngle];
    var analog_custom = finalDominantColor.schemeFromDegrees(listOfdegrees);

    amvis.imageData.analog = analog;
    amvis.imageData.analog_custom = analog_custom;
    amvis.imageData.neutral = neutral;

    if (amvis.connected) {
        amvis.socket.emit('remote_informations', amvis.remoteInformations);
    }

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
 * Converts RGB Array to CSS friendly String
 *
 * @param  {array} rgbArray
 * @return {string}
 */
amvis.rgbToString = function(rgbArray) {
    "use strict";
    return 'rgb(' + rgbArray[0] + ', ' + rgbArray[1] + ', ' + rgbArray[2] + ')';
};
