"use strict";

var { Address4 } = require("./ipv4");
var { Address6 } = require("./ipv6");
var { AddressError } = require("./address-error");
const helpers = require("./v6/helpers");

module.exports = {
    Address4,
    Address6,
    AddressError,
    v6: { helpers },
};
