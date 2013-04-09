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
controller.settings = {}; // Discard Settings
controller.connected = false;
controller.ready = false;


/////////////////////////
// Startup             //
/////////////////////////

jQuery(document).ready(function() {
    getSettings();
});


/////////////////////////
// Functions           //
/////////////////////////

function submitSettings() {
    socket.emit('upload_settings', controller.settings);
}

function getSettings() {
    socket.emit('get_settings');
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
        console.log('NO SETTINGS ON SERVER! TRYING AGAIN.');
        setTimeout(function(){socket.emit('get_settings');}, 3000);
    }

    console.dir(data);
    controller.settings = data;
});

socket.on('msg', function (data) {
    console.log('MESSAGE FROM SERVER: ' + data);
});
