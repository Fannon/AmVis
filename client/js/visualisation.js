/* global amvis */
/* jshint jquery:true, devel:true */

/////////////////////////
// Variables           //
/////////////////////////

/** Visualisation Namespace */
amvis.vis = {};
/** Visualisation Programs Namespace */
amvis.vis.programs = {};


////////////////////////////
// Visualisation Handling //
////////////////////////////

/**
 * Set current Program
 *
 * TODO: Fade In
 *
 * @param {string} program
 */
amvis.vis.setProgram = function(program) {
    "use strict";

    if ($.inArray(program, amvis.settings.vis.programs)) {
        amvis.vis.stopCurrentProgram();

        // Start new Program
        amvis.vis.currentProgram = program;
        amvis.vis.programs[program].init();
    } else {
        console.log('Program not allowed/found');
    }

};

/**
 * Stops currently running Program
 * TODO: Fade to black
 */
amvis.vis.stopCurrentProgram = function() {
    "use strict";
    // TODO: Stop current Program
};

/**
 * Sets an Image Overlay (Logo etc.)
 * @param {string} imageName
 */
amvis.vis.setImageOverlay = function(imageName) {
    "use strict";
    // TODO: Add Image to Overlay
    $('#imageOveray').html();
};

/**
 * Sets HTML Overlay (Text etc.)
 *
 * @param {string} html
 */
amvis.vis.setHtmlOverlay = function(html) {
    "use strict";
    // TODO: Add Image to Overlay
    $('#imageOveray').html();
};


///////////////////////
// Programs          //
///////////////////////

/**
 * Colorpalette Plugin
 * Analysiert die aktuellen Farben und gibt dazu passende Farbpaletten und -informationen aus
 *
 * @author Simon Heimler
 */
amvis.vis.programs.colorpalette = {};
amvis.vis.programs.colorpalette.init = function() {
    "use strict";

    // TODO: Rewrite this to work with ThreeJS or with amvis.vis.setHtmlOverlay();

    setInterval(function(){
        var metaDataObject = amvis.calculateMetaData();
        // console.log(metaDataObject);

        if (metaDataObject) {
            var imageData = metaDataObject.image;
            var html = '<div id="colordebug">';

            html += '<div style="background-color: #000">Motion Score: ' + imageData.motion_score + '</div><br>';

            html += '<div style="background-color: ' + imageData.dominant.toCSS() + '">DOMINANT</div><br>';

            for (var j = 0; j < imageData.palette.length; j++) {
                html += '<div style="background-color: ' + imageData.palette[j].toCSS() + '">PALETTE</div>';
            }

            html += '<br>';

            for (j = 0; j < imageData.analog_custom.length; j++) {
                html += '<div style="background-color: ' + imageData.analog_custom[j].toCSS() + '">ANALOG CUSTOM</div>';
            }

            html += '<br>';

            for (j = 0; j < imageData.analog.length; j++) {
                html += '<div style="background-color: ' + imageData.analog[j].toCSS() + '">ANALOG</div>';
            }

            html += '<br>';

            for (j = 0; j < imageData.neutral.length; j++) {
                html += '<div style="background-color: ' + imageData.neutral[j].toCSS() + '">NEUTRAL</div>';
            }

            html += '</div>';

            $('#colors').html(html);
        }

    }, amvis.settings.interval); // For Fast Realtime-Preview

};


/**
 * Simple Background Program
 * Analysiert die aktuellen Farben und gibt dazu passende Farbpaletten und -informationen aus
 *
 * @author Sebastian Huber
 */
amvis.vis.programs.simpleBackground = {
    VIEW_ANGLE: 45
};

amvis.vis.programs.simpleBackground.init = function() {
    "use strict";
    var self = amvis.vis.programs.simpleBackground;

};

amvis.vis.programs.simpleBackground.animate = function() {
    "use strict";
    var self = amvis.vis.programs.simpleBackground;
    self.metaDataObject = amvis.calculateMetaData();
};

amvis.vis.programs.simpleBackground.render = function() {
    "use strict";

};

///////////////////////
// Helper Functions  //
///////////////////////

// TODO: Color Palette Generation

// TODO: Color Change Interpolation
