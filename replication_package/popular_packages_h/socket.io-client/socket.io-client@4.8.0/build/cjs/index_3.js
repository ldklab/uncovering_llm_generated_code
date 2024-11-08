"use strict";

const { url } = require("./url.js");
const { Manager } = require("./manager.js");
const { Socket } = require("./socket.js");
const debugLib = require("debug");
const socketIoParser = require("socket.io-parser");

const debug = debugLib("socket.io-client");

const cache = {};

function lookup(uri, opts) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }
    opts = opts || {};
    const parsed = url(uri, opts.path || "/socket.io");
    const { source, id, path, query, queryKey } = parsed;

    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew ||
        opts["force new connection"] ||
        false === opts.multiplex ||
        sameNamespace;

    let io;
    
    if (newConnection) {
        debug("ignoring socket cache for %s", source);
        io = new Manager(source, opts);
    } else {
        if (!cache[id]) {
            debug("new io instance for %s", source);
            cache[id] = new Manager(source, opts);
        }
        io = cache[id];
    }

    if (query && !opts.query) {
        opts.query = queryKey;
    }

    return io.socket(path, opts);
}

Object.assign(lookup, {
    Manager,
    Socket,
    io: lookup,
    connect: lookup,
});

exports.Manager = Manager;
exports.Socket = Socket;
exports.protocol = socketIoParser.protocol;

module.exports = lookup;
