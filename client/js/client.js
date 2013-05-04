/* global amvis, net, jQuery */

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


/////////////////////////
// Variables           //
/////////////////////////

var Color = net.brehaut.Color;

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

/////////////////////////
// Start this app      //
/////////////////////////

jQuery(document).ready(function() {

    // Get Webcam Stream starting
    amvis.enableWebcamStream(amvis.video);
    amvis.vis.setProgram('simpleBackground');

});


/////////////////////////
// Remote Control      //
/////////////////////////

amvis.socket = io.connect(amvis.settings.serverUrl);

// On successfull Connection with Remote Server: Upload current (default) Settings
amvis.socket.on('sucessfull_connected', function () {
    // console.log('SUCCESSFUL CONNECTION');
    amvis.socket.emit('upload_settings', amvis.settings);
    // console.log('SENDING DEFAULT SETTINGS...');
    connected = true;
});

// On "New Settings" Command from Remote Server: Overwrite own Settings with new ones
amvis.socket.on('new_settings', function (data) {
    // console.log('NEW SETTINGS RECEIVED');
    // console.dir(data);
    amvis.settings = data;
});


/////////////////////////
// Processing Stream   //
/////////////////////////

/**
 * Draws current WebCam Frame to 2D Canvas
 * Calculates Metadata from media input
 */
amvis.calculateMetaData = function() {

    if (amvis.localMediaStream) {

        var metaDataObject = {};

        // draw image according to canvas width and height
        amvis.ctx.drawImage(amvis.video, 0, 0, amvis.cw, amvis.ch);

        // Get Image Metadata
        var pixels = amvis.ctx.getImageData(0, 0, amvis.cw, amvis.ch).data; // Gets Pixeldata from Image
        metaDataObject['image'] = amvis.calculateImageData(pixels);

        return metaDataObject;

    } else {
        amvis.cameraFail('No localMediaStream');
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
 * @param  {array}      pixels     Pixel Array from Canvas
 * @return {object}     Object with Color Informations
 */
amvis.calculateImageData = function(pixels) {

    if (!amvis.pixelArchive) {
        amvis.pixelArchive = pixels;
    }

    var imageData = {
        'palette': []
    };
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
        if(!(r > amvis.settings.maxBrightness && g > amvis.settings.maxBrightness && b > amvis.settings.maxBrightness) &&
            r > amvis.settings.minBrightness && g > amvis.settings.minBrightness && b > amvis.settings.minBrightness) {
            pixelArray.push([r,g,b]);
        }

        // Calculate Motion Score
        var motionDiff = amvis.fastAbs(amvis.pixelArchive[i] - r) + amvis.fastAbs(amvis.pixelArchive[i+1] - g) + amvis.fastAbs(amvis.pixelArchive[i+2] - b);
        motionScore += motionDiff/3;

        i += 4;
    }

    amvis.pixelArchive = pixels;
    imageData['motion_score'] = Math.round((motionScore / amvis.totalPixels) * 100) / 100;
    amvis.remoteInformations.motionScore = imageData['motion_score'];

    // Send array to quantize function which clusters values using median cut algorithm
    var cmap = MMCQ.quantize(pixelArray, 5);
    var palette = cmap.palette();


    ////////////////////////////////
    // Calculate Palette          //
    ////////////////////////////////

    // Convert RGB Arrays to Color Objects
    imageData['palette'][0] = Color(palette[0]);
    imageData['palette'][1] = Color(palette[1]);
    imageData['palette'][2] = Color(palette[2]);
    imageData['palette'][3] = Color(palette[3]);
    imageData['palette'][4] = Color(palette[4]);


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
    if (amvis.settings.saturation > 0) {
        finalDominantColor = finalDominantColor.saturateByRatio(amvis.settings.saturation);
    } else if (amvis.settings.saturation < 0) {
        finalDominantColor = finalDominantColor.desaturateByRatio(-amvis.settings.saturation);
    }

    // Shift the hue if not 0
    if (amvis.settings.shiftHue > 0) {
        finalDominantColor = finalDominantColor.shiftHue(amvis.settings.shiftHue);
    }

    amvis.remoteInformations.dominantColor = finalDominantColor.toCSS();
    imageData['dominant'] = finalDominantColor;


    ////////////////////////////////
    // Calculate Palettes         //
    ////////////////////////////////

    // TODO: Write generic Function which returns Colorpalettes (?)

    var analog = finalDominantColor.analogousScheme();

    var neutral = finalDominantColor.neutralScheme();

    var listOfdegrees = [-2 * amvis.settings.analogAngle, -amvis.settings.analogAngle, 0, amvis.settings.analogAngle, 2*amvis.settings.analogAngle];
    var analog_custom = finalDominantColor.schemeFromDegrees(listOfdegrees);

    imageData['analog'] = analog;
    imageData['analog_custom'] = analog_custom;
    imageData['neutral'] = neutral;

    if (amvis.connected) {
        amvis.socket.emit('remote_informations', amvis.remoteInformations);
    }

    return imageData;

};


///////////////////////
// Helper Functions  //
///////////////////////

/**
 * Cross Browser Shim for HTML5 Webcam Input
 * http://wolframhempel.com/2012/11/27/getusermedia-cross-browser-shim/
 *
 * @param  {[type]} videoDomElement [description]
 * @return {[type]}                 [description]
 */
amvis.enableWebcamStream = function(videoDomElement) {

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
        getUserMedia.call( navigator, amvis.settings.webcamoptions, onStream, onError );
    }
};

/**
 * On Camera Failure
 *
 * @param  {object} e Error Description / Object
 */
amvis.cameraFail = function (e) {
    console.log('Camera Fail / Not ready: ', e);
};

/**
 * Converts RGB Array to CSS friendly String
 * @param  {array} rgbArray
 * @return {string}
 */
amvis.rgbToString = function(rgbArray) {
    return 'rgb(' + rgbArray[0] + ', ' + rgbArray[1] + ', ' + rgbArray[2] + ')';
};

/**
 * Fast Absolute Calculation
 * http://www.adobe.com/devnet/html5/articles/javascript-motion-detection.html
 */
amvis.fastAbs = function(value) {
    // equivalent to Math.abs();
    return (value ^ (value >> 31)) - (value >> 31);
};
