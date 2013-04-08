/////////////////////////////////////////
// Client Main JavaScript ///////////////
/////////////////////////////////////////

/////////////////////////
// Variables & Options //
/////////////////////////

var video = document.querySelector("#vid");
var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
var cw = canvas.width;
var ch = canvas.height;
var pixelCount = cw*ch;

var localMediaStream = null;
var options = {video:true, audio:false}; // (Video only)

/////////////////////////
// Get Webcam Stream   //
/////////////////////////

// Cross Browser
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL;

// Get Webcam Stream
navigator.getUserMedia(options, function (stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
}, cameraFail);


/////////////////////////
// Processing Stream   //
/////////////////////////

// Camera Failing
var cameraFail = function (e) {
    console.log('Camera Frail: ', e);
};

/**
 * Draws current WebCam Frame to 2D Canvas
 * Calculates Color informations
 */
var calculate = function() {
    if (localMediaStream) {

        // draw image according to canvas width and height
        ctx.drawImage(video, 0, 0, cw, ch);

        // Gets Pixeldata from Image
        var pixels = ctx.getImageData(0, 0, cw, ch).data;

        var colorObject = calculateColors(pixels, pixelCount);
        console.dir(colorObject);

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

    var colorObject = {};

    var pixelArray = [];
    for (var i = 0; i < pixelCount; i++) {
        // If pixel is mostly opaque and not white
        if(pixels[i*4+3] >= 125){
            if(!(pixels[i*4] > 250 && pixels[i*4+1] > 250 && pixels[i*4+2] > 250)){
                pixelArray.push( [pixels[i*4], pixels[i*4+1], pixels[i*4+2]]);
            }
        }
    }

    // Send array to quantize function which clusters values using median cut algorithm
    var cmap = MMCQ.quantize(pixelArray, 5);
    var palette = cmap.palette();

    colorObject['dominant'] = {"r": palette[0][0], "g": palette[0][1], "b": palette[0][2]};
    colorObject['palette'] = palette;

    return colorObject;

}


// Start / Change Module

// Read Options, execute Options

