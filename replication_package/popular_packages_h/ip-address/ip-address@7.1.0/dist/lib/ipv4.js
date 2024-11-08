"use strict";
/* eslint-disable no-param-reassign */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address4 = void 0;
var common = __importStar(require("./common"));
var constants = __importStar(require("./v4/constants"));
var address_error_1 = require("./address-error");
var jsbn_1 = require("jsbn");
var sprintf_js_1 = require("sprintf-js");
/**
 * Represents an IPv4 address
 * @class Address4
 * @param {string} address - An IPv4 address string
 */
var Address4 = /** @class */ (function () {
    function Address4(address) {
        this.groups = constants.GROUPS;
        this.parsedAddress = [];
        this.parsedSubnet = '';
        this.subnet = '/32';
        this.subnetMask = 32;
        this.v4 = true;
        /**
         * Returns true if the address is correct, false otherwise
         * @memberof Address4
         * @instance
         * @returns {Boolean}
         */
        this.isCorrect = common.isCorrect(constants.BITS);
        /**
         * Returns true if the given address is in the subnet of the current address
         * @memberof Address4
         * @instance
         * @returns {boolean}
         */
        this.isInSubnet = common.isInSubnet;
        this.address = address;
        var subnet = constants.RE_SUBNET_STRING.exec(address);
        if (subnet) {
            this.parsedSubnet = subnet[0].replace('/', '');
            this.subnetMask = parseInt(this.parsedSubnet, 10);
            this.subnet = "/" + this.subnetMask;
            if (this.subnetMask < 0 || this.subnetMask > constants.BITS) {
                throw new address_error_1.AddressError('Invalid subnet mask.');
            }
            address = address.replace(constants.RE_SUBNET_STRING, '');
        }
        this.addressMinusSuffix = address;
        this.parsedAddress = this.parse(address);
    }
    Address4.isValid = function (address) {
        try {
            // eslint-disable-next-line no-new
            new Address4(address);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    /*
     * Parses a v4 address
     */
    Address4.prototype.parse = function (address) {
        var groups = address.split('.');
        if (!address.match(constants.RE_ADDRESS)) {
            throw new address_error_1.AddressError('Invalid IPv4 address.');
        }
        return groups;
    };
    /**
     * Returns the correct form of an address
     * @memberof Address4
     * @instance
     * @returns {String}
     */
    Address4.prototype.correctForm = function () {
        return this.parsedAddress.map(function (part) { return parseInt(part, 10); }).join('.');
    };
    /**
     * Converts a hex string to an IPv4 address object
     * @memberof Address4
     * @static
     * @param {string} hex - a hex string to convert
     * @returns {Address4}
     */
    Address4.fromHex = function (hex) {
        var padded = hex.replace(/:/g, '').padStart(8, '0');
        var groups = [];
        var i;
        for (i = 0; i < 8; i += 2) {
            var h = padded.slice(i, i + 2);
            groups.push(parseInt(h, 16));
        }
        return new Address4(groups.join('.'));
    };
    /**
     * Converts an integer into a IPv4 address object
     * @memberof Address4
     * @static
     * @param {integer} integer - a number to convert
     * @returns {Address4}
     */
    Address4.fromInteger = function (integer) {
        return Address4.fromHex(integer.toString(16));
    };
    /**
     * Converts an IPv4 address object to a hex string
     * @memberof Address4
     * @instance
     * @returns {String}
     */
    Address4.prototype.toHex = function () {
        return this.parsedAddress.map(function (part) { return sprintf_js_1.sprintf('%02x', parseInt(part, 10)); }).join(':');
    };
    /**
     * Converts an IPv4 address object to an array of bytes
     * @memberof Address4
     * @instance
     * @returns {Array}
     */
    Address4.prototype.toArray = function () {
        return this.parsedAddress.map(function (part) { return parseInt(part, 10); });
    };
    /**
     * Converts an IPv4 address object to an IPv6 address group
     * @memberof Address4
     * @instance
     * @returns {String}
     */
    Address4.prototype.toGroup6 = function () {
        var output = [];
        var i;
        for (i = 0; i < constants.GROUPS; i += 2) {
            var hex = sprintf_js_1.sprintf('%02x%02x', parseInt(this.parsedAddress[i], 10), parseInt(this.parsedAddress[i + 1], 10));
            output.push(sprintf_js_1.sprintf('%x', parseInt(hex, 16)));
        }
        return output.join(':');
    };
    /**
     * Returns the address as a BigInteger
     * @memberof Address4
     * @instance
     * @returns {BigInteger}
     */
    Address4.prototype.bigInteger = function () {
        return new jsbn_1.BigInteger(this.parsedAddress.map(function (n) { return sprintf_js_1.sprintf('%02x', parseInt(n, 10)); }).join(''), 16);
    };
    /**
     * Helper function getting start address.
     * @memberof Address4
     * @instance
     * @returns {BigInteger}
     */
    Address4.prototype._startAddress = function () {
        return new jsbn_1.BigInteger(this.mask() + '0'.repeat(constants.BITS - this.subnetMask), 2);
    };
    /**
     * The first address in the range given by this address' subnet.
     * Often referred to as the Network Address.
     * @memberof Address4
     * @instance
     * @returns {Address4}
     */
    Address4.prototype.startAddress = function () {
        return Address4.fromBigInteger(this._startAddress());
    };
    /**
     * The first host address in the range given by this address's subnet ie
     * the first address after the Network Address
     * @memberof Address4
     * @instance
     * @returns {Address4}
     */
    Address4.prototype.startAddressExclusive = function () {
        var adjust = new jsbn_1.BigInteger('1');
        return Address4.fromBigInteger(this._startAddress().add(adjust));
    };
    /**
     * Helper function getting end address.
     * @memberof Address4
     * @instance
     * @returns {BigInteger}
     */
    Address4.prototype._endAddress = function () {
        return new jsbn_1.BigInteger(this.mask() + '1'.repeat(constants.BITS - this.subnetMask), 2);
    };
    /**
     * The last address in the range given by this address' subnet
     * Often referred to as the Broadcast
     * @memberof Address4
     * @instance
     * @returns {Address4}
     */
    Address4.prototype.endAddress = function () {
        return Address4.fromBigInteger(this._endAddress());
    };
    /**
     * The last host address in the range given by this address's subnet ie
     * the last address prior to the Broadcast Address
     * @memberof Address4
     * @instance
     * @returns {Address4}
     */
    Address4.prototype.endAddressExclusive = function () {
        var adjust = new jsbn_1.BigInteger('1');
        return Address4.fromBigInteger(this._endAddress().subtract(adjust));
    };
    /**
     * Converts a BigInteger to a v4 address object
     * @memberof Address4
     * @static
     * @param {BigInteger} bigInteger - a BigInteger to convert
     * @returns {Address4}
     */
    Address4.fromBigInteger = function (bigInteger) {
        return Address4.fromInteger(parseInt(bigInteger.toString(), 10));
    };
    /**
     * Returns the first n bits of the address, defaulting to the
     * subnet mask
     * @memberof Address4
     * @instance
     * @returns {String}
     */
    Address4.prototype.mask = function (mask) {
        if (mask === undefined) {
            mask = this.subnetMask;
        }
        return this.getBitsBase2(0, mask);
    };
    /**
     * Returns the bits in the given range as a base-2 string
     * @memberof Address4
     * @instance
     * @returns {string}
     */
    Address4.prototype.getBitsBase2 = function (start, end) {
        return this.binaryZeroPad().slice(start, end);
    };
    /**
     * Returns true if the given address is a multicast address
     * @memberof Address4
     * @instance
     * @returns {boolean}
     */
    Address4.prototype.isMulticast = function () {
        return this.isInSubnet(new Address4('224.0.0.0/4'));
    };
    /**
     * Returns a zero-padded base-2 string representation of the address
     * @memberof Address4
     * @instance
     * @returns {string}
     */
    Address4.prototype.binaryZeroPad = function () {
        return this.bigInteger().toString(2).padStart(constants.BITS, '0');
    };
    /**
     * Groups an IPv4 address for inclusion at the end of an IPv6 address
     * @returns {String}
     */
    Address4.prototype.groupForV6 = function () {
        var segments = this.parsedAddress;
        return this.address.replace(constants.RE_ADDRESS, sprintf_js_1.sprintf('<span class="hover-group group-v4 group-6">%s</span>.<span class="hover-group group-v4 group-7">%s</span>', segments.slice(0, 2).join('.'), segments.slice(2, 4).join('.')));
    };
    return Address4;
}());
exports.Address4 = Address4;
//# sourceMappingURL=ipv4.js.map