const net           = require('net');

const client        = new net.Socket();

const SocketReply   = require('../../index');
let sock            = new SocketReply(client, "tcp");

client.connect(3000, '127.0.0.1', function() {
    sock.write('Hello, server! Love, Client.', (data) => {
        console.log(data);
    });

    sock.on('data', (data) => {
        console.log(data);
    });
});

client.on('close', function() {
    console.log('Connection closed');
});

client.on('error', function(err) {
    console.log(err);
});