class SocketReply{

    /**
     *
     * @param instance - Instance is an instance of anything that has an on and emit method
     */
    constructor(instance, service, options) {
        if (instance === undefined) {
            throw new Error("Instance is undefined");
        }else if (instance.on === undefined) {
            throw new Error("Instance does not have an on method");
        }else if (instance.emit === undefined && instance.write === undefined && instance.send === undefined) {
            throw new Error("Instance does not have any of the following methods: emit, write, send");
        }
        if (service === undefined) {
            throw new Error("Service is undefined");
        }


        if (options !== undefined) {
            if (options.replyTimeout !== undefined) {
                if (typeof options.replyTimeout !== "number") {
                    throw new Error("Clear cache must be a number");
                }

                this.replyTimeout = options.replyTimeout * 1000;
            }else {
                this. replyTimeout = 10 * 1000;
            }
        }else {
            this.replyTimeout = 10 * 1000;
        }

        this.service = service.toLowerCase();
        this.instance = instance;

        this.sentMessages = [];


        // Receive reply data and call the callback
        if (this.service === "socket.io") {
            this.instance.on("socket_reply", (data) => {

                if (typeof data === "string") {
                    try {
                        data = JSON.parse(data);

                        if (data.constructor === ({}).constructor && data.isInstanceOfSocketReply === true) {
                            if (data.isReply === true) {
                                const message = this.sentMessages.find(message => message.id === data.id);

                                if (message) {
                                    message.callback(data.packet);

                                    this.sentMessages.find(message => message.id === data.id).timeout !== null ? clearTimeout(this.sentMessages.find(message => message.id === data.id).timeout) : null;
                                    this.sentMessages.splice(this.sentMessages.indexOf(message), 1);
                                }
                            }
                        }
                    } catch (e) {
                    }

                } else if (data.constructor === ({}).constructor && data.isInstanceOfSocketReply === true) {
                    if (data.isReply === true) {
                        const message = this.sentMessages.find(message => message.id === data.id);

                        if (message) {
                            message.callback(data.packet);

                            this.sentMessages.find(message => message.id === data.id).timeout !== null ? clearTimeout(this.sentMessages.find(message => message.id === data.id).timeout) : null;
                            this.sentMessages.splice(this.sentMessages.indexOf(message), 1);
                        }
                    }

                }
            });

        }else if (this.service === "udp") {
            this.instance.on("message", (data, rinfo) => {
                try {
                    data = JSON.parse(data.toString());

                    if (data.constructor === ({}).constructor && data.isInstanceOfSocketReply === true) {
                        if (data.isReply === true) {
                            const message = this.sentMessages.find(message => message.id === data.id);

                            if (message) {
                                message.callback(null, data.packet, rinfo);

                                this.sentMessages.find(message => message.id === data.id).timeout !== null ? clearTimeout(this.sentMessages.find(message => message.id === data.id).timeout) : null;
                                this.sentMessages.splice(this.sentMessages.indexOf(message), 1);
                            }
                        }
                    }
                }catch (e) {}
            });
        }else if (this.service === "tcp") {
            this.instance.on("data", (data) => {
                try {
                    data = JSON.parse(data.toString());

                    if (data.constructor === ({}).constructor && data.isInstanceOfSocketReply === true) {
                        if (data.isReply === true) {
                            const message = this.sentMessages.find(message => message.id === data.id);

                            if (message) {
                                message.callback(data.packet);

                                this.sentMessages.find(message => message.id === data.id).timeout !== null ? clearTimeout(this.sentMessages.find(message => message.id === data.id).timeout) : null;
                                this.sentMessages.splice(this.sentMessages.indexOf(message), 1);
                            }
                        }
                    }
                }catch (e) {}
            });
        }
    }

    on(channel, callback) {
        if (channel === undefined) {
            throw new Error("Channel is undefined");
        }
        if (callback === undefined) {
            throw new Error("Callback is undefined");
        }

        if (this.service === "socket.io") {

            this.instance.on(channel, (data) => {
                if (typeof data === "string") {
                    try {
                        data = JSON.parse(data);

                        if (data.constructor === ({}).constructor && data.isInstanceOfSocketReply === true) {
                            if (data.isReply === false) {
                                callback(data.packet, (reply) => {
                                    this.instance.emit("socket_reply", {
                                        isInstanceOfSocketReply: true,
                                        isReply: true,
                                        id: data.id,
                                        packet: reply
                                    });
                                });
                            }
                        }
                    }catch (e) {
                        callback(JSON.stringify(data));
                    }

                }else if (data.constructor === ({}).constructor && data.isInstanceOfSocketReply === true) {
                    if (data.isReply === false) {
                        callback(data.packet, (reply) => {
                            this.instance.emit("socket_reply", {
                                isInstanceOfSocketReply: true,
                                isReply: true,
                                id: data.id,
                                packet: reply
                            });
                        });
                    }

                }else {
                    callback(data);
                }
            });
        }else if (this.service === "tcp") {
            if (channel !== "data") {
                throw new Error("Channel must be data for other sockets");
            }

            this.instance.on(channel, (data) => {
                try {
                    data = JSON.parse(data.toString());

                    if (data.constructor === ({}).constructor && data.isInstanceOfSocketReply === true) {
                        if (data.isReply === false) {
                            callback(data.packet, (reply) => {
                                this.instance.write(JSON.stringify({
                                    isInstanceOfSocketReply: true,
                                    isReply: true,
                                    id: data.id,
                                    packet: reply
                                }));
                            });
                        }
                    }else {
                        callback(Buffer.from(JSON.stringify(data)));
                    }
                }catch (e) {
                    callback(data);
                }
            });
        }else if (this.service === "udp") {
            if (channel !== "message") {
                throw new Error("Channel must be message for other sockets");
            }

            this.instance.on(channel, (data, rinfo) => {
                try {
                    data = JSON.parse(data.toString());

                    if (data.constructor === ({}).constructor && data.isInstanceOfSocketReply === true) {
                        if (data.isReply === false) {
                            callback(data.packet, rinfo, (reply, err) => {
                                this.instance.send(JSON.stringify({
                                    isInstanceOfSocketReply: true,
                                    isReply: true,
                                    id: data.id,
                                    packet: reply
                                }), rinfo.port, rinfo.address, (err) => {
                                    if (err)
                                        callback(err);
                                });
                            });
                        }
                    }else {
                        callback(Buffer.from(JSON.stringify(data)), rinfo);
                    }
                }catch (e) {
                    callback(data, rinfo);
                }
            });
        }
    }

    // This is for socket.io
    emit(channel, data, callback) {
        if (this.service !== "socket.io") {
            throw new Error("This method is only for socket.io");
        }

        if (callback) {
            const id = generateUniqueId();

            this.instance.emit(channel, {
                isInstanceOfSocketReply: true,
                isReply: false,
                id: id,
                packet: data
            });

            this.sentMessages.push({
                id: id,
                callback: callback,
                timeout: this.replyTimeout === -1 ? null : setTimeout(() => {
                    this.sentMessages.find(message => message.id === id).callback("Reply has timed out. Try increasing the replyTimeout option");
                    this.sentMessages.splice(this.sentMessages.indexOf(this.sentMessages.find(message => message.id === id)), 1);
                }, this.replyTimeout)
            });
        }else {
            this.instance.emit(channel, data);
        }
    }

    // This is for tcp sockets
    write(data, callback) {
        if (callback) {
            const id = generateUniqueId();

            this.instance.write(JSON.stringify({
                isInstanceOfSocketReply: true,
                isReply: false,
                id: id,
                packet: data
            }));

            this.sentMessages.push({
                id: id,
                callback: callback,
                timeout: this.replyTimeout === -1 ? null : setTimeout(() => {
                    this.sentMessages.find(message => message.id === id).callback("Reply has timed out. Try increasing the replyTimeout option");
                    this.sentMessages.splice(this.sentMessages.indexOf(this.sentMessages.find(message => message.id === id)), 1);
                }, this.replyTimeout)
            });
        }else {
            this.instance.emit(data);
        }
    }

    // This is for udp sockets
    send(data, port, hostname, callback) {
        if (callback) {
            const id = generateUniqueId();

            this.instance.send(JSON.stringify({
                isInstanceOfSocketReply: true,
                isReply: false,
                id: id,
                packet: data
            }), port, hostname, (err) => {
                if (err)
                    callback(err, null);
            });

            this.sentMessages.push({
                id: id,
                callback: callback,
                timeout: this.replyTimeout === -1 ? null : setTimeout(() => {
                    this.sentMessages.find(message => message.id === id).callback("Reply has timed out. Try increasing the replyTimeout option");
                    this.sentMessages.splice(this.sentMessages.indexOf(this.sentMessages.find(message => message.id === id)), 1);
                }, this.replyTimeout)
            });
        }else {
            this.instance.emit(data);
        }
    }
}

function generateUniqueId() {
    const length = 36;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_@";

    let result = "";
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return result;
}

if (typeof module !== "undefined") {
    module.exports = SocketReply;
}