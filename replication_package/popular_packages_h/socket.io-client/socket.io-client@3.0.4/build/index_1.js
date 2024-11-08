"use strict";
const url_1 = require("./url");
const manager_1 = require("./manager");
const socket_1 = require("./socket");
const debug = require("debug")("socket.io-client");
const socket_io_parser_1 = require("socket.io-parser");

/**
 * Module exports.
 */
module.exports = exports = lookup;
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Managers cache.
 */
const cache = (exports.managers = {});

/**
 * `lookup` - Main function to create or retrieve a socket connection.
 * 
 * @param {String|Object} uri - The URI or options object.
 * @param {Object} opts - The options for the connection.
 * @returns {Socket} A socket instance connected to the server.
 */
function lookup(uri, opts) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }
    opts = opts || {};
    const parsed = url_1.url(uri);
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew ||
        opts["force new connection"] ||
        false === opts.multiplex ||
        sameNamespace;
    let io;
    if (newConnection) {
        debug("ignoring socket cache for %s", source);
        io = new manager_1.Manager(source, opts);
    } else {
        if (!cache[id]) {
            debug("new io instance for %s", source);
            cache[id] = new manager_1.Manager(source, opts);
        }
        io = cache[id];
    }
    if (parsed.query && !opts.query) {
        opts.query = parsed.query;
    }
    return io.socket(parsed.path, opts);
}

/**
 * Protocol version.
 *
 * @public
 */
Object.defineProperty(exports, "protocol", { enumerable: true, get: function () { return socket_io_parser_1.protocol; } });

/**
 * Expose lookup function to be used as `connect` and `io`.
 *
 * @param {String} uri
 * @public
 */
exports.io = lookup;
exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @public
 */
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_1.Socket; } });
Object.defineProperty(exports, "Manager", { enumerable: true, get: function () { return manager_1.Manager; } });
