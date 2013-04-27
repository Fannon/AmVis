/////////////////////////
// Variables           //
/////////////////////////

/**
 * Global Namespace, Singleton
 */
var visualisation = {};
visualisation.programs = {};

/**
 * Array with available Foreground Programs
 * @type {Array}
 */
visualisation.foregroundPrograms = [
    'colorpalette'
];
/**
 * Array with available Background Programs
 * @type {Array}
 */
visualisation.backgroundPrograms = [
    'colorpalette'
];


////////////////////////////
// Visualisation Handling //
////////////////////////////

visualisation.setForeground = function(program) {
    // TODO: Check if available
    visualisation.foreground = program;
    visualisation.programs[visualisation.foreground]();
};

visualisation.setBackground = function(program) {
    // TODO: Check if available
    visualisation.background = program;
    visualisation.programs[visualisation.background]();
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
visualisation.programs.colorpalette = function() {

    setInterval(function(){
        var metaDataObject = calculateMetaData();

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

    }, settings.interval); // For Fast Realtime-Preview

};

///////////////////////
// Helper Functions  //
///////////////////////

// TODO: Color Palette Generation

// TODO: Color Change Interpolation
