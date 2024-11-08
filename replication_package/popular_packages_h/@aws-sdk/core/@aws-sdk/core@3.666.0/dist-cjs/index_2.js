"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const clientExports = require("./submodules/client/index");
const httpAuthSchemesExports = require("./submodules/httpAuthSchemes/index");
const protocolsExports = require("./submodules/protocols/index");

Object.keys(clientExports).forEach((key) => {
    if (key === "default" || exports.hasOwnProperty(key)) return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function() {
            return clientExports[key];
        },
    });
});

Object.keys(httpAuthSchemesExports).forEach((key) => {
    if (key === "default" || exports.hasOwnProperty(key)) return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function() {
            return httpAuthSchemesExports[key];
        },
    });
});

Object.keys(protocolsExports).forEach((key) => {
    if (key === "default" || exports.hasOwnProperty(key)) return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function() {
            return protocolsExports[key];
        },
    });
});
