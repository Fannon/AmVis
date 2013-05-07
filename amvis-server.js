/* global process */
/* jshint node: true, devel: true */

/**
 * AmVis Node.js Server
 * Serves static files for Client and Controller
 * Handles Websocket Communication
 *
 * @author Simon Heimler
 */

//////////////////////////////
// Import Modules           //
//////////////////////////////

var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


//////////////////////////////
// Variables and Settings   //
//////////////////////////////

var port = (process.argv[2] ? process.argv[2] : 8888); // Use Console Argument if there
var settings = {};


//////////////////////////////
// Startup                  //
//////////////////////////////

server.listen(port);
console.log('### SERVER LISTENING ON PORT ' + port);


//////////////////////////////
// Express Configuration    //
//////////////////////////////

app.configure(function() {
    "use strict";
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + ''));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(app.router);
});


//////////////////////////////
// Socket.io Configuration  //
//////////////////////////////

// Configuration
io.enable('browser client minification'); // send minified client
io.enable('browser client etag'); // apply etag caching logic based on version number
io.enable('browser client gzip'); // gzip the file
io.set('log level', 1); // reduce logging


//////////////////////////////
// Socket.io Communication  //
//////////////////////////////

io.sockets.on('connection', function(socket) {
    "use strict";

    console.log('+++ NEW REMOTE CONNECTION');

    // On new Connection: Send Success Message
    socket.emit('sucessfull_connected', 'Sucessfully Connected!');

    // On Settings uploaded: Write them and broadcast to other connected Controllers/Clients
    socket.on('upload_settings', function(data) {
        settings = data;
        socket.broadcast.emit('new_settings', data);
    });

    // Remote Informations from Client (Current Color, etc.) broadcasting to Controllers
    socket.on('remote_informations', function(data) {
        socket.broadcast.emit('remote_informations', data);
    });

    // Gets actual Settings from Server
    socket.on('get_settings', function() {
        // console.log('--> SENDING SETTINGS BY REQUEST');
        socket.emit('current_settings', settings);
    });

    socket.on('disconnect', function() {
        console.log('--- DISCONNECT FROM REMOTE');
    } );

});
