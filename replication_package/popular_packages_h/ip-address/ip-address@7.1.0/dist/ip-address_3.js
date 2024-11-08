"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.v6 = exports.Address6 = exports.Address4 = void 0;

var ipv4_1 = require("./lib/ipv4");
exports.Address4 = ipv4_1.Address4;

var ipv6_1 = require("./lib/ipv6");
exports.Address6 = ipv6_1.Address6;

var helpers = require("./lib/v6/helpers");
exports.v6 = { helpers: helpers };
