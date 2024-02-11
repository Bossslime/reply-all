const net               = require('net');
const SocketReply       = require('../../index');

const server = net.createServer(function(socket) {
    let sock            = new SocketReply(socket, "tcp");

    sock.on('data', (packet, reply) => {
        console.log(packet);
        reply({success: true});
    });

    socket.on('error', function(err) {
    });
});

server.listen(3000, '127.0.0.1');