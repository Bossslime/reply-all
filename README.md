# Reply All

Reply All is a library that adds the ability to reply to messages sent using messaging protocols. 

The reason I made this is I got tired of making variables and finding out where in my code the message was sent from. This helps with this issue by allowing me to add a callback to my message requests that is called when I call a reply function on the receiver side.

Supported Protocols:
 - TCP
 - UDP
 - Socket.IO (I made it for this not realizing it was already a feature)

Check out the `examples` folder for examples on how to use this library.