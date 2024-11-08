"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v6 = exports.Address6 = exports.Address4 = void 0;

const { Address4 } = require("./lib/ipv4");
const { Address6 } = require("./lib/ipv6");
const helpers = require("./lib/v6/helpers");

exports.Address4 = Address4;
exports.Address6 = Address6;
exports.v6 = { helpers };
