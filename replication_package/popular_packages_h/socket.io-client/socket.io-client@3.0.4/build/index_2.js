"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = exports.io = exports.Manager = exports.protocol = void 0;

const { url } = require("./url");
const { Manager } = require("./manager");
const { Socket } = require("./socket");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return Socket; } });

const debug = require("debug")("socket.io-client");

/**
 * Module exports.
 */
module.exports = exports = connect;

/**
 * Managers cache.
 */
const cache = (exports.managers = {});

function connect(uri, opts = {}) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }

    const parsed = url(uri);
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;

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
        opts.query = parsed.query;
    }

    return io.socket(parsed.path, opts);
}

exports.io = connect;

/**
 * Protocol version.
 *
 * @public
 */
const { protocol } = require("socket.io-parser");
Object.defineProperty(exports, "protocol", { enumerable: true, get: function () { return protocol; } });

/**
 * `connect`.
 *
 * @param {String} uri
 * @public
 */
exports.connect = connect;

/**
 * Expose constructors for standalone build.
 *
 * @public
 */
Object.defineProperty(exports, "Manager", { enumerable: true, get: function () { return Manager; } });
