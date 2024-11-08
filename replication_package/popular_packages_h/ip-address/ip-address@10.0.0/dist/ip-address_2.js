"use strict";
const ipv4 = require("./ipv4");
const ipv6 = require("./ipv6");
const addressError = require("./address-error");
const { helpers } = require("./v6/helpers");

exports.Address4 = ipv4.Address4;
exports.Address6 = ipv6.Address6;
exports.AddressError = addressError.AddressError;
exports.v6 = { helpers };
