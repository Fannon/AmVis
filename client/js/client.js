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
// Parse Settings      //
/////////////////////////

// TODO: Evtl. durch Controller setzen lassen
var interval = 250; // in ms
var analogAngle = 20; // Colorcircle Rotation in Grad for calculating analog palette
var maxBrightness = 100;
var minBrightness = 20;

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

        showColors(colorObject);

    } else {
        cameraFail('No localMediaStream');
    }
};

setInterval(function(){
    calculate();
}, interval); // For Fast Realtime-Preview

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

        // Just take Pixels that are not too bright or to dark
        if(!(pixels[i*4] > maxBrightness && pixels[i*4+1] > maxBrightness && pixels[i*4+2] > maxBrightness) && pixels[i*4] > minBrightness && pixels[i*4+1] > minBrightness && pixels[i*4+2] > minBrightness){
            pixelArray.push( [pixels[i*4], pixels[i*4+1], pixels[i*4+2]]);
        }

    }

    // Send array to quantize function which clusters values using median cut algorithm
    var cmap = MMCQ.quantize(pixelArray, 5);
    var palette = cmap.palette();

    colorObject['palette'] = palette;


    ////////////////////////////////
    // Calculate Dominant Color   //
    ////////////////////////////////

    // Using a "Diff Score" to guess which Color is most interesting
    // Also this takes care of too greyish colors that produce a very boring analogue palette

    colorObject['dominant'] = palette[0];

    for (var j = 0; j < palette.length; j++) {
        var diff = 0;
        diff += Math.abs(palette[j][0] - palette[j][1]);
        diff += Math.abs(palette[j][0] - palette[j][2]);
        diff += Math.abs(palette[j][1] - palette[j][2]);

        if (diff > 100) {
            colorObject['dominant'] = palette[j];
            break;
        }

        // console.log('DIFF Score: ' + diff + ' bei #' + (j+1));
    }


    ////////////////////////////////
    // Calculate Analog Palette   //
    ////////////////////////////////
    //
    var dominantColor = Color().rgb(colorObject['dominant']);

    var analog = [
        // Starting with the Dominant Color minus two Rotations
        dominantColor.rotate(-2 * analogAngle).rgbArray(),
        dominantColor.rotate(analogAngle).rgbArray(),
        dominantColor.rotate(analogAngle).rgbArray(),
        dominantColor.rotate(analogAngle).rgbArray(),
        dominantColor.rotate(analogAngle).rgbArray()
    ];

    colorObject['analog'] = analog;


    ////////////////////////////////
    // Calculate Complement Color //
    ////////////////////////////////

    dominantColor = Color().rgb(colorObject['dominant']);
    colorObject['negate'] = dominantColor.negate().rgbArray();

    return colorObject;

}

/**
 * Debugging Funktion die das berechnete ColorObject mit farbigen DIVs visuell darstellt
 *
 * @param  {object} colorObject
 */
function showColors(colorObject) {

    var html = '<div id="colordebug">';

    html += '<div style="background-color: rgba(' + colorObject.dominant[0] + ',' + colorObject.dominant[1] + ',' +colorObject.dominant[2] + ', 1.0)">DOMINANT</div><br>';


    for (var i = 0; i < colorObject.palette.length; i++) {
        html += '<div style="background-color: rgba(' + colorObject.palette[i][0] + ',' + colorObject.palette[i][1] + ',' +colorObject.palette[i][2] + ', 1.0)">PALETTE</div>';
    }

    html += '<br>';

    for (var j = 0; j < colorObject.analog.length; j++) {
        html += '<div style="background-color: rgba(' + colorObject.analog[j][0] + ',' + colorObject.analog[j][1] + ',' +colorObject.analog[j][2] + ', 1.0)">ANALOG</div>';
    }

    html += '<br><div style="background-color: rgba(' + colorObject.negate[0] + ',' + colorObject.negate[1] + ',' +colorObject.negate[2] + ', 1.0)">COMPLEMENT</div>';

    html += '</div>';

    $('#colors').html(html);

}
