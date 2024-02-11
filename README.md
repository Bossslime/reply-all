# Reply All

Reply All is a library that adds the ability to reply to messages sent using messaging protocols. 

The reason I made this is I got tired of making variables and finding out where in my code the message was sent from. This helps with this issue by allowing me to add a callback to my message requests that is called when I call a reply function on the receiver side.

Supported Protocols:
 - TCP
 - UDP
 - Socket.IO (I made it for this not realizing it was already a feature)

# TCP Example
In this example I send a message to the server and reply to the client, but this can be done either way.

## Client
```javascript
const net           = require('net');
const client        = new net.Socket();

//Import and init the library
const SocketReply   = require('../../index');
let sock            = new SocketReply(client, "tcp");

client.connect(3000, '127.0.0.1', function() {
    //This send a message to the server, notice the callback
    //That is called when (or if) the server replies
    //If the callback is not provided, the message is sent without reply functionality
    sock.write('Hello, server! Love, Client.', (data) => {
        console.log(data);
    });

    
    //No packet will be received if the message is a reply
    //Hoewever if you listen for packets the normal way, you will receive the reply which you dont want.
    //So make sure you only listen for packets using the libraries socket instance
    sock.on('data', (packet, reply) => {
        console.log(packet);
    });
});

//All other events must be listened to by the normal means
client.on('error', (err) => {
    console.log(err);
});
```

## Server
```javascript
const net               = require('net');
const SocketReply       = require('../../index');

const server = net.createServer(function(socket) {
    //This must be initialized for each socket
    let sock            = new SocketReply(socket, "tcp");

    sock.on('data', (packet, reply) => {
        console.log(packet);
        reply({success: true});
    });
    
    //All other events must be listened to by the normal means
    socket.on('error', function(err) {
    });
});

server.listen(3000, '127.0.0.1');
```

Check out the `examples` folder for other examples on how to use this library.