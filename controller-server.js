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
var express  = require("express");
var app      = express();
var server   = require('http').createServer(app);
var io       = require('socket.io').listen(server);


//////////////////////////////
// Variables and Settings   //
//////////////////////////////

var port     = 8888;
var settings = {};

server.listen(port);


//////////////////////////////
// Express Configuration    //
//////////////////////////////

app.configure(function(){
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

io.sockets.on('connection', function(socket) {

    // On new Connection: Send Success Message
    socket.emit('sucessfull_connected', 'Sucessfully Connected!');

    // On Settings uploaded: Write them and
    socket.on('upload_settings', function(data) {

        console.log('NEW SETTINGS RECEIVED');

        console.log(settings);

        settings = data;

        console.log('SENDING SETTINGS BY PUSH');
        socket.broadcast.emit('new_settings', data);

        socket.emit('msg', 'Settings Sucessfully Uploaded');

    });

    // Remote Informations (Current Color, etc.) broadcasting
    socket.on('remote_informations', function(data) {

        console.log('REMOTE INFORMATIONS RECEIVED');
        socket.broadcast.emit('remote_informations', data);

    });

    // Gets actual Settings from Server
    socket.on('get_settings', function() {
        console.log('SENDING SETTINGS BY REQUEST');
        socket.emit('current_settings', settings);
    });

});
