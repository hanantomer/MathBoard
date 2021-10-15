"use strict";
const feathers = require("../node_modules/@feathersjs/feathers");
const socketio = require("../node_modules/@feathersjs/socketio-client");
const io = require("../node_modules/socket.io-client");
const socket = io("http://localhost:3030");
const client = feathers();
client.configure(socketio(socket));
const notaionSync = client.service("notationSync");

module.exports = {
    create: {
        write: {
            after: async (req, res, context) => {
                notaionSync.create(req.notation);
                return context.continue;
            },
        },
    },
};
