"use strict";

const urlParser = require("./url.js");
const { Manager } = require("./manager.js");
const { Socket } = require("./socket.js");
const debug = require("debug")("socket.io-client");
const { protocol } = require("socket.io-parser");

exports.Manager = Manager;
exports.Socket = Socket;
exports.protocol = protocol;

const cache = {};

function lookup(uri, opts = {}) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }

    const parsed = urlParser.url(uri, opts.path || "/socket.io");
    const { source, id, path } = parsed;

    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew || opts["force new connection"] || opts.multiplex === false || sameNamespace;

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

    if (parsed.query && !opts.query) {
        opts.query = parsed.queryKey;
    }

    return io.socket(path, opts);
}

Object.assign(lookup, {
    Manager,
    Socket,
    io: lookup,
    connect: lookup,
});

module.exports = lookup;
