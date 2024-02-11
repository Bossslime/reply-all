//SocketTwo.js must be running already to see the example working

const UDP          = require('dgram')
const socketOne    = UDP.createSocket('udp4')
const port         = 3001

const SocketReply  = require('../../index')
let sock           = new SocketReply(socketOne, 'udp')

socketOne.on('listening', () => {
    // Server address it’s using to listen

    const address = socketOne.address()

    console.log('Listining to ', 'Address: ', address.address, 'Port: ', address.port)
})

socketOne.bind(port, '127.0.0.1')

sock.send("test", 3000, '127.0.0.1', (err, replyData) => {
    if (err) {
        // This could be if the message failed to send or if the reply was timed out
        console.log(err);
    }else {
        console.log('sdfsdf')
        // console.log(data);
    }
});