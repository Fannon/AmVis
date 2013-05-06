/* global amvis, io */
/* jshint jquery:true, devel:true */

/**
 * AmVis Remote Control
 * Connects to a NodeJS Socket.io Server and handles the Communication Protocol
 *
 * @author Simon Heimler
 */

/////////////////////////
// Remote Control      //
/////////////////////////

if ('undefined' !== typeof io) {
    amvis.socket = io.connect(amvis.settings.main.serverUrl);

    /** On successfull Connection with Remote Server: Upload current (default) Settings */
    amvis.socket.on('sucessfull_connected', function () {
        "use strict";
        amvis.socket.emit('upload_settings', amvis.settings.visual);
        amvis.connected = true;
    });

    /** On "New Settings" Command from Remote Server: Overwrite own Settings with new ones */
    amvis.socket.on('new_settings', function (data) {
        "use strict";
        amvis.settings.visual = data;
    });
} else {
    console.log('No Server Communication!');
}

