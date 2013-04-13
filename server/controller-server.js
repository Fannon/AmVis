var io = require('socket.io').listen(8888);

var settings = {};

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
