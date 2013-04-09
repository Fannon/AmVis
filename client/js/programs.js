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

    var metaDataObject;

    setInterval(function(){
        metaDataObject = calculateMetaData();
        debugColors(metaDataObject['colors']);
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

    html += '<div style="background-color: rgba(' + colorObject.dominant[0] + ',' + colorObject.dominant[1] + ',' +colorObject.dominant[2] + ', 1.0)">DOMINANT</div><br>';

    html += '<div style="background-color: rgba(' + colorObject.dominant_avg[0] + ',' + colorObject.dominant_avg[1] + ',' +colorObject.dominant_avg[2] + ', 1.0)">DOMINANT AVERAGE</div><br>';


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
