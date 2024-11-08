"use strict";

const url = require("./url.js");
const { Manager } = require("./manager.js");
const { Socket } = require("./socket.js");
const debugModule = require("debug");
const debug = debugModule("socket.io-client");

const cache = {};

function lookup(uri, opts) {
    if (typeof uri === "object") [uri, opts] = [undefined, uri];
    opts = opts || {};
    const parsed = url(uri, opts.path || "/socket.io");
    const { source, id, path, query, queryKey } = parsed;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew || opts["force new connection"] || opts.multiplex === false || sameNamespace;
    
    let io;
    if (newConnection) {
        debug(`ignoring socket cache for ${source}`);
        io = new Manager(source, opts);
    } else {
        if (!cache[id]) {
            debug(`new io instance for ${source}`);
            cache[id] = new Manager(source, opts);
        }
        io = cache[id];
    }
    if (query && !opts.query) opts.query = queryKey;
    return io.socket(path, opts);
}

Object.assign(lookup, {
    Manager,
    Socket,
    io: lookup,
    connect: lookup,
});

const { protocol } = require("socket.io-parser");

module.exports = lookup;

exports.Manager = Manager;
exports.Socket = Socket;
exports.protocol = protocol;
exports.io = lookup;
exports.connect = lookup;
