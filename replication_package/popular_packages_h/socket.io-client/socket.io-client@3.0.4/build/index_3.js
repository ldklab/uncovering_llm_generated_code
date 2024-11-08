"use strict";

// Import required modules and libraries
const debug = require("debug")("socket.io-client");
const { url } = require("./url");
const { Manager: ManagerClass } = require("./manager");
const { Socket } = require("./socket");
const { protocol } = require("socket.io-parser");

// Expose key components for module access
exports.Socket = Socket;
exports.protocol = protocol;
exports.Manager = ManagerClass;
exports.io = exports.connect = lookup;

// Managers cache to store and reuse Manager instances
const cache = {};

/**
 * Main function to set up or retrieve an existing connection.
 * 
 * @param {String|Object} uri - The URI or options object for connection.
 * @param {Object} opts - Options for configuring the connection.
 * @returns {Object} A socket instance.
 */
function lookup(uri, opts) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }

    opts = opts || {};

    const parsed = url(uri);
    const { source, id, path, query } = parsed;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew ||
                          opts["force new connection"] ||
                          false === opts.multiplex ||
                          sameNamespace;

    let io;

    if (newConnection) {
        debug("ignoring socket cache for %s", source);
        io = new ManagerClass(source, opts);
    } else {
        if (!cache[id]) {
            debug("new io instance for %s", source);
            cache[id] = new ManagerClass(source, opts);
        }
        io = cache[id];
    }

    if (query && !opts.query) {
        opts.query = query;
    }

    return io.socket(parsed.path, opts);
}
