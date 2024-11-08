"use strict";

var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });

exports.Socket = exports.Manager = exports.protocol = void 0;

// Assigning the lookup function to exports
exports.io = lookup;
exports.connect = lookup;
exports.default = lookup;

// Import required modules
const url_js_1 = require("./url.js");
const manager_js_1 = require("./manager.js");
Object.defineProperty(exports, "Manager", { enumerable: true, get: function() { return manager_js_1.Manager; } });

const socket_js_1 = require("./socket.js");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function() { return socket_js_1.Socket; } });

const debug_1 = __importDefault(require("debug")); // Import debug for logging
const debug = (0, debug_1.default)("socket.io-client"); // Initialize debug

// Cache for managers
const cache = {};

function lookup(uri, opts) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }
    opts = opts || {};
    
    // Parse the URL
    const parsed = (0, url_js_1.url)(uri, opts.path || "/socket.io");
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    
    // Determine if a new connection is needed
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew ||
        opts["force new connection"] ||
        false === opts.multiplex ||
        !sameNamespace;
    
    let io;
    if (newConnection) {
        debug("ignoring socket cache for %s", source);
        io = new manager_js_1.Manager(source, opts);
    } else {
        if (!cache[id]) {
            debug("new io instance for %s", source);
            cache[id] = new manager_js_1.Manager(source, opts);
        }
        io = cache[id];
    }
    
    if (parsed.query && !opts.query) {
        opts.query = parsed.queryKey;
    }
    
    return io.socket(parsed.path, opts);
}

// Provide backward compatibility
Object.assign(lookup, {
    Manager: manager_js_1.Manager,
    Socket: socket_js_1.Socket,
    io: lookup,
    connect: lookup,
});

// Import the protocol version
var socket_io_parser_1 = require("socket.io-parser");
Object.defineProperty(exports, "protocol", { enumerable: true, get: function() { return socket_io_parser_1.protocol; } });

module.exports = lookup;
