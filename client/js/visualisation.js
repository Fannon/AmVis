/* global amvis */

/////////////////////////
// Variables           //
/////////////////////////

/**
 * Global Namespace, Singleton
 */
amvis.visualisation = {};
amvis.visualisation.programs = {};

/**
 * Array with available Foreground Programs
 * @type {Array}
 */
amvis.visualisation.availablePrograms = [
    'simpleBackground',
    'colorpalette'
];


////////////////////////////
// Visualisation Handling //
////////////////////////////

amvis.visualisation.setProgram = function(program) {
    // TODO: Check if available

    // TODO: Stop old Program
    amvis.visualisation.stopCurrentProgram();

    // Start new Program
    amvis.visualisation.currentProgram = program;
    amvis.visualisation.programs[amvis.visualisation.currentProgram]();
};

amvis.visualisation.stopCurrentProgram = function() {
    // TODO: Stop current Program
};


amvis.visualisation.setBackground = function(program) {
    // TODO: Check if available
    amvis.visualisation.background = program;
    amvis.visualisation.programs[amvis.visualisation.background]();
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
amvis.visualisation.programs.colorpalette = function() {

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

///////////////////////
// Helper Functions  //
///////////////////////

// TODO: Color Palette Generation

// TODO: Color Change Interpolation
