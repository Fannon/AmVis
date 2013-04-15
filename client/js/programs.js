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
            debugColors(metaDataObject['image']);
        }

    }, settings.interval); // For Fast Realtime-Preview

};

///////////////////////
// Helper Functions  //
///////////////////////

/**
 * Debugging Funktion die das berechnete imageData mit farbigen DIVs visuell darstellt
 *
 * @param  {object} imageData
 */
function debugColors(imageData) {

    console.log(imageData);


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

    // html += '<br><div style="background-color: rgba(' + imageData.negate[0] + ',' + imageData.negate[1] + ',' +imageData.negate[2] + ', 1.0)">COMPLEMENT</div>';

    html += '</div>';

    $('#colors').html(html);

}
