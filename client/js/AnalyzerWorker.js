/* global self, importScripts, MMCQ */
/* jshint jquery:true, devel:true */


self.addEventListener('message', function(e) {
    "use strict";

    ////////////////////////////////
    // Importing external Scripts //
    ////////////////////////////////

    importScripts('../lib/quantize.js');


    ////////////////////////////////
    // Variables                  //
    ////////////////////////////////

    var pixels = e.data.pixels;
    var pixelArchive = e.data.pixelArchive;
    var totalPixels = e.data.totalPixels;
    var settings = e.data.settings;

    var returnData = {};

    var pixelArray = [];
    var motionScore = 0;


    ////////////////////////////////
    // Calculation                //
    ////////////////////////////////

    // Looping over Pixel Array, takes 4 steps (rgba) with each iteration
    // while loop with i and n cached: http://jsperf.com/fors-vs-while/58
    var i = 0;
    var n = pixels.length;
    while(i < n) {

        var r = pixels[i];
        var g = pixels[i + 1];
        var b = pixels[i + 2];
        // Alpha (pixels[i+3]) is ignored

        // Put every interesting Pixel into the pixelArray which will be quantized for calculating the Color Palette
        if (!(r > settings.visual.maxBrightness && g > settings.visual.maxBrightness && b > settings.visual.maxBrightness) &&
            r > settings.visual.minBrightness && g > settings.visual.minBrightness && b > settings.visual.minBrightness) {
            pixelArray.push([r, g, b]);
        }

        // Calculate Motion Score
        var motionDiff = Math.abs(pixelArchive[i] - r) + Math.abs(pixelArchive[i + 1] - g) + Math.abs(pixelArchive[i + 2] - b);
        motionScore += motionDiff / 3;

        i += 4;
    }

    returnData.newPixelArchive = pixels;
    returnData.motionScore = Math.round((motionScore / totalPixels) * 100 * settings.visual.motionScoreDegree) / 100;


    ////////////////////////////////
    // Calculate Main Palette     //
    ////////////////////////////////

    // Send array to quantize function which clusters values using median cut algorithm
    if (pixelArray.length > 0) {
        var cmap = MMCQ.quantize(pixelArray, 5);
        var paletteTemp = cmap.palette();
        if (paletteTemp && paletteTemp.length > 0) {
            returnData.palette = paletteTemp;
        } else {
            console.log('Error in Quantizer!');
        }
    } else {
        console.log('No Pixeldata left to analyze');
    }

    self.postMessage(returnData);

}, false);
