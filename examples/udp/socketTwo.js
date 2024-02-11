const UDP          = require('dgram')
const socketTwo    = UDP.createSocket('udp4')
const port         = 3000


const SocketReply  = require('../../index')
let sock           = new SocketReply(socketTwo, 'udp')

socketTwo.on('listening', () => {
    // Server address it’s using to listen

    const address = socketTwo.address()

    console.log('Listining to ', 'Address: ', address.address, 'Port: ', address.port)
})

sock.on('message', (packet, rinfo, reply) => {
    console.log(packet.toString());
    reply({success: true}, err => {
        if (err) {
            // This is if the message failed to send
            console.log(err);
        }
    });
});

socketTwo.bind(port, '127.0.0.1')