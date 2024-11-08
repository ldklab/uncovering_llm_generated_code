"use strict";

const { url } = require("./url");
const { Manager } = require("./manager");
const { Socket } = require("./socket");
const debug = require("debug")("socket.io-client");
const { protocol } = require("socket.io-parser");

module.exports = exports = connect;

const managersCache = {};

function connect(uri, options) {
    if (typeof uri === "object") {
        options = uri;
        uri = undefined;
    }

    options = options || {};

    const parsedUri = url(uri);
    const { source, id, path, query } = parsedUri;

    const shouldCreateNewConnection = options.forceNew ||
                                      options["force new connection"] ||
                                      options.multiplex === false ||
                                      (managersCache[id] && path in managersCache[id]["nsps"]);

    let ioManager;

    if (shouldCreateNewConnection) {
        debug("Creating new Manager instance for %s", source);
        ioManager = new Manager(source, options);
    } else {
        if (!managersCache[id]) {
            debug("No cached manager found, creating new Manager for %s", source);
            managersCache[id] = new Manager(source, options);
        }
        ioManager = managersCache[id];
    }

    if (query && !options.query) {
        options.query = query;
    }

    return ioManager.socket(path, options);
}

exports.io = connect;
exports.connect = connect;
exports.protocol = protocol;
exports.Manager = Manager;
exports.Socket = Socket;
