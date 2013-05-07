/* global amvis, io */
/* jshint jquery: true, devel: true */

/**
 * HTML5 Visualizer Remote Controller
 *
 * // TODO: Show actual dominant color
 * // TODO: Just send / receive essential parameters
 *
 * @author Simon Heimler
 */
amvis.controller = {};


/////////////////////////
// Variables           //
/////////////////////////

var socket = io.connect(amvis.settings.main.serverUrl);

amvis.controller.connected = false;
amvis.controller.ready = false;
amvis.controller.autoSubmit = false;

// Current Settings Object
amvis.controller.settings = {}; // Discard Settings


/////////////////////////
// Startup             //
/////////////////////////
jQuery(document).ready(function() {
    "use strict";

    amvis.controller.toggleAutoSubmitButton = $('#toggleAutoSubmit');

    // Activate Toggling Button
    setInterval(function(){
        if (amvis.controller.toggleAutoSubmitButton.val() === 'on') {
            amvis.controller.submitSettings();
        }
    }, amvis.settings.advanced.controllerInterval);

    // Get Settings from Client
    amvis.controller.getSettings();

    // Load available Programs into ListView
    var html = '';
    for (var i = 0; i < amvis.settings.programs.length; i++) {
        html += '<li><a href="#" onclick="amvis.controller.setProgram(this)">' + amvis.settings.programs[i] + '</a></li>';
    }
    $('#programList').append(html).listview("refresh");

    if (!io) {
        $('#motionScore').text('WARNING: NO SOCKET CONNECTION!');
    }

});


/////////////////////////
// Functions           //
/////////////////////////

amvis.controller.submitSettings = function() {
    "use strict";
    var newSettings = amvis.controller.readValues();
    socket.emit('upload_settings', newSettings);
};

amvis.controller.setProgram = function(el) {
    "use strict";
    console.dir(el);
    socket.emit('set_program', el.text);
};

amvis.controller.getSettings = function() {
    "use strict";
    socket.emit('get_settings');
};

amvis.controller.defaultSettings = function() {
    "use strict";
    amvis.controller.settings = amvis.settings.visual;
    amvis.controller.writeValues();
};

amvis.controller.readValues = function() {
    "use strict";
    var saturation = $('#saturation').val();
    var hue = $('#hue').val();
    var analogAngle = $('#analogAngle').val();
    var minBrightness = $('#minBrightness').val();
    var maxBrightness = $('#maxBrightness').val();
    var minColorfulness = $('#minColorfulness').val();

    amvis.controller.settings.saturation = saturation/100;
    amvis.controller.settings.shiftHue = parseInt(hue, 10);
    amvis.controller.settings.analogAngle = parseInt(analogAngle, 10);
    amvis.controller.settings.minBrightness = parseInt(minBrightness, 10);
    amvis.controller.settings.maxBrightness = parseInt(maxBrightness, 10);
    amvis.controller.settings.minColorfulness = parseInt(minColorfulness, 10);

    return amvis.controller.settings;
};

amvis.controller.writeValues = function() {
    "use strict";
    $('#saturation').val(amvis.controller.settings.saturation*100);
    $('#hue').val(amvis.controller.settings.shiftHue);
    $('#analogAngle').val(amvis.controller.settings.analogAngle);
    $('#minBrightness').val(amvis.controller.settings.minBrightness);
    $('#maxBrightness').val(amvis.controller.settings.maxBrightness);
    $('#minColorfulness').val(amvis.controller.settings.minColorfulness);

    $('.refresh').slider('refresh');
};

/////////////////////////
// Transfer Protocol   //
/////////////////////////

// On successfull Connection
socket.on('sucessfull_connected', function () {
    "use strict";
    $('#motionScore').text('CONNECTED BUT NO DATA');
    amvis.controller.connected = true;
});

// On incoming Settings from Server
socket.on('current_settings', function (data) {
    "use strict";
    amvis.controller.ready = true;
    amvis.controller.settings = data;
    amvis.controller.writeValues();
});

// On incoming Settings from Server
socket.on('new_settings', function (data) {
    "use strict";
    amvis.controller.settings = data;
    amvis.controller.writeValues();
});

// On incoming Remote Informations (Current Data Values..)
socket.on('remote_informations', function(data) {
    "use strict";
    $('#dominantColor').css('background-color', data.dominantColor);
    $('#motionScore').text('MOTION SCORE: ' + data.motionScore);
});

socket.on('msg', function (data) {
    "use strict";
    console.log('MESSAGE FROM SERVER: ' + data);
});
