/* global amvis */

/////////////////////////
// Variables           //
/////////////////////////

/**
 * Global Namespace, Singleton
 */
amvis.vis = {};
amvis.vis.programs = {};


////////////////////////////
// Visualisation Handling //
////////////////////////////

amvis.vis.setProgram = function(program) {
    // TODO: Check if available

    // TODO: Stop old Program
    amvis.vis.stopCurrentProgram();

    // Start new Program
    amvis.vis.currentProgram = program;
    amvis.vis.programs[program].init();
};

amvis.vis.stopCurrentProgram = function() {
    // TODO: Stop current Program
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

    setInterval(function(){
        var metaDataObject = amvis.calculateMetaData();
        // console.log(metaDataObject);

        if (metaDataObject) {
            var imageData = metaDataObject['image'];
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

    var self = amvis.vis.programs.simpleBackground;

};

amvis.vis.programs.simpleBackground.animate = function() {
    var self = amvis.vis.programs.simpleBackground;
    self.metaDataObject = amvis.calculateMetaData();
};
amvis.vis.programs.simpleBackground.render = function() {

};

///////////////////////
// Helper Functions  //
///////////////////////

// TODO: Color Palette Generation

// TODO: Color Change Interpolation
