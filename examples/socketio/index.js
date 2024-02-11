const express               = require('express');
const app                   = express();

const http                  = require('http');
const server                = http.createServer(app);
const io                    = require("socket.io")(server);

const SocketReply           = require('./index');


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/*', (req, res) => {
    res.sendFile(__dirname + "/" + req.params[0]);
});

server.listen(3000, () => {

});

io.on('connection', (socket) => {
    const sock = new SocketReply(socket, "socket.io");

    sock.on('packet', (packet, reply) => {
        console.log(packet);
        reply({success: true});
    });
})