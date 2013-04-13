/**
 * HTML5 Ambient Visualizer
 *
 * Uses Webcam to analyse current Colors of the envirionment
 * and generates matching WebGL Visualisations
 *
 * Uses https://github.com/brehaut/color-js for Color Management
 *
 * @author Simon Heimler
 * @author Sebastian Huber
 */


/////////////////////////
// Variables           //
/////////////////////////

var video = document.querySelector("#video");
var canvas = document.querySelector('#canvas');
var localMediaStream = null;
var ctx = canvas.getContext('2d');
var cw = canvas.width;
var ch = canvas.height;
var totalPixels = cw * ch;
var Color = net.brehaut.Color;

var connected = false;
var pixelArchive = null;
var remoteInformations = {};

/////////////////////////
// Start this app      //
/////////////////////////

jQuery(document).ready(function() {

    // Get Webcam Stream starting
    enableWebcamStream(video);

    // Start default program
    programs.colorpalette();

});


/////////////////////////
// Remote Control      //
/////////////////////////

var socket = io.connect(settings.serverUrl);

// On successfull Connection with Remote Server: Upload current (default) Settings
socket.on('sucessfull_connected', function () {
    console.log('SUCCESSFUL CONNECTION');
    socket.emit('upload_settings', settings);
    console.log('SENDING DEFAULT SETTINGS...');
    connected = true;
});

// On "New Settings" Command from Remote Server: Overwrite own Settings with new ones
socket.on('new_settings', function (data) {
    console.log('NEW SETTINGS RECEIVED');
    console.dir(data);
    settings = data;
});


/////////////////////////
// Processing Stream   //
/////////////////////////

/**
 * Draws current WebCam Frame to 2D Canvas
 * Calculates Metadata from media input
 */
var calculateMetaData = function() {

    if (localMediaStream) {

        var metaDataObject = {};

        // draw image according to canvas width and height
        ctx.drawImage(video, 0, 0, cw, ch);

        // Get Image Metadata
        var pixels = ctx.getImageData(0, 0, cw, ch).data; // Gets Pixeldata from Image
        metaDataObject['image'] = calculateImageData(pixels);

        return metaDataObject;

    } else {
        cameraFail('No localMediaStream');
    }
};


///////////////////////
// Helper Functions ///
///////////////////////

/**
 * Calculates the imageData Object which contains Color Informations about the current Frame
 *
 * Uses quantize.js Copyright 2008 Nick Rabinowitz.
 * Uses codesnippet from: https://github.com/lokesh/color-thief
 *
 * @param  {array}      pixels     Pixel Array from Canvas
 * @return {object}     Object with Color Informations
 */
function calculateImageData(pixels) {

    if (!pixelArchive) {
        pixelArchive = pixels;
    }

    var imageData = {
        'palette': []
    };
    var pixelArray = [];
    var dominantColor;
    var motionScore = 0;

    // Looping over Pixel Array, takes 4 steps (rgba) with each iteration
    var i = 0;
    while (i < pixels.length) {

        var r = pixels[i];
        var g = pixels[i+1];
        var b = pixels[i+2];
        // Alpha (pixels[i+3]) is ignored

        // Put every interesting Pixel into the pixelArray which will be quantized for calculating the Color Palette
        if(!(r > settings.maxBrightness && g > settings.maxBrightness && b > settings.maxBrightness) &&
            r > settings.minBrightness && g > settings.minBrightness && b > settings.minBrightness) {
            pixelArray.push([r,g,b]);
        }

        // Calculate Motion Score
        var motionDiff = fastAbs(pixelArchive[i] - r) + fastAbs(pixelArchive[i+1] - g) + fastAbs(pixelArchive[i+2] - b);
        motionScore += motionDiff/3;

        i += 4;
    }

    pixelArchive = pixels;
    imageData['motion_score'] = Math.round((motionScore / totalPixels) * 100) / 100;
    remoteInformations.motionScore = imageData['motion_score'];

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
    // Also this takes care of too greyish colors that produce a very boring analogue palette
    if (settings.minColorfulness !== 0) {
        for (var j = 0; j < palette.length; j++) {

            var diff = 0;
            diff += Math.abs(palette[j][0] - palette[j][1]);
            diff += Math.abs(palette[j][0] - palette[j][2]);
            diff += Math.abs(palette[j][1] - palette[j][2]);

            if (diff > settings.minColorfulness) {
                dominantColor = palette[j];
                break;
            }
            // console.log('DIFF Score: ' + diff + ' bei #' + j);
        }
    }

    // PostProcessing Color
    var finalDominantColor = Color(dominantColor);

    // Add / Remove Saturation if setting not 0
    if (settings.saturation > 0) {
        finalDominantColor = finalDominantColor.saturateByRatio(settings.saturation);
    } else if (settings.saturation < 0) {
        finalDominantColor = finalDominantColor.desaturateByRatio(-settings.saturation);
    }

    // Shift the hue if not 0
    if (settings.shiftHue > 0) {
        finalDominantColor = finalDominantColor.shiftHue(settings.shiftHue);
    }

    remoteInformations.dominantColor = finalDominantColor.toCSS();
    imageData['dominant'] = finalDominantColor;


    ////////////////////////////////
    // Calculate Palettes         //
    ////////////////////////////////

    // TODO: Write generic Function which returns Colorpalettes (?)

    var analog = finalDominantColor.analogousScheme();

    var neutral = finalDominantColor.neutralScheme();

    var listOfdegrees = [-2 * settings.analogAngle, -settings.analogAngle, 0, settings.analogAngle, 2*settings.analogAngle];
    var analog_custom = finalDominantColor.schemeFromDegrees(listOfdegrees);

    imageData['analog'] = analog;
    imageData['analog_custom'] = analog_custom;
    imageData['neutral'] = neutral;

    if (connected) {
        socket.emit('remote_informations', remoteInformations);
    }

    return imageData;

}

/**
 * Cross Browser Shim for HTML5 Webcam Input
 * http://wolframhempel.com/2012/11/27/getusermedia-cross-browser-shim/
 *
 * @param  {[type]} videoDomElement [description]
 * @return {[type]}                 [description]
 */
enableWebcamStream = function(videoDomElement) {

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
            localMediaStream = stream;
        } catch( e ) {
            /**
            * Firefox
            */
            if( videoDomElement.srcObject ) {
                videoDomElement.srcObject = stream;
                localMediaStream = stream;
            } else {
                videoDomElement.mozSrcObject = stream;
                localMediaStream = stream;
            }
            videoDomElement.play();
        }
    };

    var onError = function( error ) {
        cameraFail(error);
    };

    if(getUserMedia) {
        getUserMedia.call( navigator, settings.webcamoptions, onStream, onError );
    }
};

/**
 * On Camera Failure
 *
 * @param  {object} e Error Description / Object
 */
var cameraFail = function (e) {
    console.log('Camera Fail / Not ready: ', e);
};

/**
 * Converts RGB Array to CSS friendly String
 * @param  {array} rgbArray
 * @return {string}
 */
function rgbToString(rgbArray) {
    return 'rgb(' + rgbArray[0] + ', ' + rgbArray[1] + ', ' + rgbArray[2] + ')';
}

/**
 * Fast Absolute Calculation
 * http://www.adobe.com/devnet/html5/articles/javascript-motion-detection.html
 */
function fastAbs(value) {
    // equivalent to Math.abs();
    return (value ^ (value >> 31)) - (value >> 31);
}
