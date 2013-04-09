/**
 * HTML5 Ambient Visualizer
 *
 * Uses Webcam to analyse current Colors of the envirionment
 * and generates matching WebGL Visualisations
 *
 * Uses https://github.com/brehaut/color-js for Color Management
 *
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
var pixelCount = cw*ch;
var Color = net.brehaut.Color;
var colorRingBuffer = settings.defaultColorArray;


/////////////////////////
// Receive Controlling //
/////////////////////////

var socket = io.connect(settings.serverUrl);

// On successfull Connection with Remote Server: Upload current (default) Settings
socket.on('sucessfull_connected', function () {
    console.log('SUCCESSFUL CONNECTION');
    socket.emit('upload_settings', settings);
    console.log('SENDING DEFAULT SETTINGS...');
});

// On "New Settings" Command from Remote Server: Overwrite own Settings with new ones
socket.on('new_settings', function (data) {
    console.log('NEW SETTINGS RECEIVED');
    console.dir(data);
    settings = data;
});

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
// Processing Stream   //
/////////////////////////

/**
 * Draws current WebCam Frame to 2D Canvas
 * Calculates Metadata from actual videoframe
 */
var calculateMetaData = function() {

    if (localMediaStream) {

        var metaDataObject = {};

        // draw image according to canvas width and height
        ctx.drawImage(video, 0, 0, cw, ch);

        // Get Color Metadata
        var pixels = ctx.getImageData(0, 0, cw, ch).data; // Gets Pixeldata from Image
        metaDataObject['colors'] = calculateColors(pixels, pixelCount);

        return metaDataObject;

    } else {
        cameraFail('No localMediaStream');
    }
};


///////////////////////
// Helper Functions ///
///////////////////////

/**
 * Calculates the ColorObject which contains Color Informations about the current Frame
 *
 * Uses quantize.js Copyright 2008 Nick Rabinowitz.
 * Uses codesnippet from: https://github.com/lokesh/color-thief
 *
 * @param  {array}      pixels     Pixel Array from Canvas
 * @param  {integer}    pixelCount Total Number of Canvas Pixels
 * @return {object}     Object with Color Informations
 */
function calculateColors(pixels, pixelCount) {

    var colorObject = {
        'palette': []
    };
    var pixelArray = [];
    var dominantColor;

    for (var i = 0; i < pixelCount; i++) {

        // Just take Pixels that are not too bright or too dark
        if(!(pixels[i*4] > settings.maxBrightness && pixels[i*4+1] > settings.maxBrightness && pixels[i*4+2] > settings.maxBrightness) && pixels[i*4] > settings.minBrightness && pixels[i*4+1] > settings.minBrightness && pixels[i*4+2] > settings.minBrightness){
            pixelArray.push( [pixels[i*4], pixels[i*4+1], pixels[i*4+2]]);
        }
    }

    // Send array to quantize function which clusters values using median cut algorithm
    var cmap = MMCQ.quantize(pixelArray, 5);
    var palette = cmap.palette();


    ////////////////////////////////
    // Calculate Palette          //
    ////////////////////////////////

    // Convert RGB Arrays to Color Objects
    colorObject['palette'][0] = Color(rgbToString(palette[0]));
    colorObject['palette'][1] = Color(rgbToString(palette[1]));
    colorObject['palette'][2] = Color(rgbToString(palette[2]));
    colorObject['palette'][3] = Color(rgbToString(palette[3]));
    colorObject['palette'][4] = Color(rgbToString(palette[4]));


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
    var finalDominantColor = Color(rgbToString(dominantColor));

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

    colorObject['dominant'] = finalDominantColor;

    ////////////////////////////////
    // Calculate Dominant Average //
    ////////////////////////////////

    // TODO: Use a Ringbuffer for this

    // colorRingBuffer[3] = colorRingBuffer[2];
    // colorRingBuffer[2] = colorRingBuffer[1];
    // colorRingBuffer[1] = colorRingBuffer[0];
    // colorRingBuffer[0] = dominantColor;

    // var r = 0;
    // var g = 0;
    // var b = 0;
    // for (i = 0; i < colorRingBuffer.length; i++) {

    //     // console.log(colorRingBuffer[i]);

    //     r += colorRingBuffer[i][0];
    //     g += colorRingBuffer[i][1];
    //     b += colorRingBuffer[i][2];
    // }
    // avg = [Math.round(r/colorRingBuffer.length), Math.round(g/colorRingBuffer.length), Math.round(b/colorRingBuffer.length)];

    // colorObject['dominant_avg'] = finalDominantColor;


    ////////////////////////////////
    // Calculate Palettes         //
    ////////////////////////////////

    // TODO: Write generic Function which returns Colorpalettes (?)

    var analog = finalDominantColor.analogousScheme();

    var neutral = finalDominantColor.neutralScheme();

    var listOfdegrees = [-2 * settings.analogAngle, -settings.analogAngle, 0, settings.analogAngle, 2*settings.analogAngle];
    var analog_custom = finalDominantColor.schemeFromDegrees(listOfdegrees);

    colorObject['analog'] = analog;
    colorObject['analog_custom'] = analog_custom;
    colorObject['neutral'] = neutral;

    return colorObject;

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
 * TODO:
 * RingBuffer um Dominant Color zu "stabilisieren"
 * Code zum Teil von: http://stackoverflow.com/a/4774081/776425
 *
 * @param  {[type]} length [description]
 * @return {[type]}        [description]
 */
function CircularBuffer(length) {
    this.totalLength = length;
    this.buffer = [];
    this.pointer = 0;
}
CircularBuffer.prototype.toString= function() {
    return '[object CircularBuffer('+this.buffer.length+') pointer ' +this.pointer + ']';
};
CircularBuffer.prototype.get= function(key) {
    return this.buffer[key];
};
CircularBuffer.prototype.push = function(item) {
    this.buffer[this.pointer] = item;
    pointer = (this.totalLength + this.pointer +1) % this.totalLength;
};
CircularBuffer.prototype.getAvg = function(){
    var r = 0;
    var g = 0;
    var b = 0;
    for (var i = 0; i < this.buffer.length; i++) {
        r += this.buffer[i][0];
        g += this.buffer[i][1];
        b += this.buffer[i][2];
    }
    return [Math.round(r/this.buffer.length), Math.round(g/this.buffer.length), Math.round(b/this.buffer.length)];
};


/**
 * Converts RGB Array to CSS friendly String
 * @param  {array} rgbArray
 * @return {string}
 */
function rgbToString(rgbArray) {
    return 'rgb(' + rgbArray[0] + ', ' + rgbArray[1] + ', ' + rgbArray[2] + ')';
}
