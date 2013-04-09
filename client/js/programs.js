var programs = {};

///////////////////////
// Programs          //
///////////////////////

/**
 * Colorpalette Plugin
 * Analysiert die aktuellen Farben und gibt dazu passende Farbpaletten und -informationen aus
 *
 * @author Simon Heimler
 */
programs.colorpalette = function() {

    setInterval(function(){
        var metaDataObject = calculateMetaData();

        if (metaDataObject) {
            debugColors(metaDataObject['colors']);
        }

    }, settings.interval); // For Fast Realtime-Preview

};

///////////////////////
// Helper Functions  //
///////////////////////

/**
 * Debugging Funktion die das berechnete ColorObject mit farbigen DIVs visuell darstellt
 *
 * @param  {object} colorObject
 */
function debugColors(colorObject) {


    var html = '<div id="colordebug">';

    html += '<div style="background-color: ' + colorObject.dominant.toCSS() + '">DOMINANT</div><br>';

    // html += '<div style="background-color: ' + colorObject.dominant_avg.toCSS() + '">DOMINANT AVG</div><br>';


    for (var j = 0; j < colorObject.palette.length; j++) {
        html += '<div style="background-color: ' + colorObject.palette[j].toCSS() + '">PALETTE</div>';
    }

    html += '<br>';

    for (j = 0; j < colorObject.analog_custom.length; j++) {
        html += '<div style="background-color: ' + colorObject.analog_custom[j].toCSS() + '">ANALOG CUSTOM</div>';
    }

    html += '<br>';

    for (j = 0; j < colorObject.analog.length; j++) {
        html += '<div style="background-color: ' + colorObject.analog[j].toCSS() + '">ANALOG</div>';
    }

    html += '<br>';

    for (j = 0; j < colorObject.neutral.length; j++) {
        html += '<div style="background-color: ' + colorObject.neutral[j].toCSS() + '">NEUTRAL</div>';
    }

    // html += '<br><div style="background-color: rgba(' + colorObject.negate[0] + ',' + colorObject.negate[1] + ',' +colorObject.negate[2] + ', 1.0)">COMPLEMENT</div>';

    html += '</div>';

    $('#colors').html(html);

}
