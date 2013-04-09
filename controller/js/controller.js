/**
 * HTML5 Visualizer Remote Controller
 *
 * @author Simon Heimler
 */


/////////////////////////
// Variables           //
/////////////////////////

var controller = {};
var socket = io.connect(settings.serverUrl);
controller.tryAgainInterval = settings.tryAgainInterval;
controller.connected = false;
controller.ready = false;
controller.autoSubmit = false;
controller.autoSubmitInterval = settings.interval;

controller.defaultSettings = settings;
controller.settings = {}; // Discard Settings

/////////////////////////
// Startup             //
/////////////////////////

jQuery(document).ready(function() {

    var toggleAutoSubmit = $('#toggleAutoSubmit');

    getSettings();

    setInterval(function(){
        if (toggleAutoSubmit.val() == 'on') {
            submitSettings();
        }
    }, controller.autoSubmitInterval);

});


/////////////////////////
// Functions           //
/////////////////////////

function submitSettings() {
    var newSettings = readValues();
    socket.emit('upload_settings', newSettings);
}

function getSettings() {
    socket.emit('get_settings');
}

function defaultSettings() {
    controller.settings = controller.defaultSettings;
    writeValues();
}

function toggleAutoSubmit() {

    if ($('#toggleAutoSubmit').hasClass('active')) {
        $('#toggleAutoSubmit').removeClass('active');
        controller.autoSubmit = false;
    } else {
        $('#toggleAutoSubmit').addClass('active');
        controller.autoSubmit = true;
    }


}

function readValues() {

    var saturation = $('#saturation').val();
    var hue = $('#hue').val();
    minBrightness = $('#minBrightness').val();
    maxBrightness = $('#maxBrightness').val();
    minColorfulness = $('#minColorfulness').val();

    controller.settings.saturation = saturation/100;
    controller.settings.shiftHue = parseInt(hue, 10);
    controller.settings.minBrightness = parseInt(minBrightness, 10);
    controller.settings.maxBrightness = parseInt(maxBrightness, 10);
    controller.settings.minColorfulness = parseInt(minColorfulness, 10);

    return controller.settings;
}

function writeValues() {

    $('#saturation').val(controller.settings.saturation*100);
    $('#hue').val(controller.settings.shiftHue);
    $('#minBrightness').val(controller.settings.minBrightness);
    $('#maxBrightness').val(controller.settings.maxBrightness);
    $('#minColorfulness').val(controller.settings.minColorfulness);

    $('.refresh').slider('refresh');
}

/////////////////////////
// Transfer Protocol   //
/////////////////////////

// On successfull Connection
socket.on('sucessfull_connected', function () {
    console.log('SUCCESSFUL CONNECTION');
    connected = true;
});

// On incoming Settings from Server
socket.on('current_settings', function (data) {

    if (data.set) {
        console.log('NEW SETTINGS RECEIVED');
        controller.ready = true;
    } else {
        console.log('NO SETTINGS ON SERVER! TRYING AGAIN IN ' + controller.tryAgainInterval + ' MS');
        setTimeout(function(){socket.emit('get_settings');}, controller.tryAgainInterval);
    }

    controller.settings = data;
    writeValues();
});

// On incoming Settings from Server
socket.on('new_settings', function (data) {

    console.log('NEW SETTINGS RECEIVED');

    controller.settings = data;
    writeValues();
});

socket.on('msg', function (data) {
    console.log('MESSAGE FROM SERVER: ' + data);
});
