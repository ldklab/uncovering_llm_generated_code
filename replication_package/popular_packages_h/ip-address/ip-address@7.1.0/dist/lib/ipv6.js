"use strict";
/* eslint-disable prefer-destructuring */
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address6 = void 0;
var common = __importStar(require("./common"));
var constants4 = __importStar(require("./v4/constants"));
var constants6 = __importStar(require("./v6/constants"));
var helpers = __importStar(require("./v6/helpers"));
var ipv4_1 = require("./ipv4");
var regular_expressions_1 = require("./v6/regular-expressions");
var address_error_1 = require("./address-error");
var jsbn_1 = require("jsbn");
var sprintf_js_1 = require("sprintf-js");
function assert(condition) {
    if (!condition) {
        throw new Error('Assertion failed.');
    }
}
function addCommas(number) {
    var r = /(\d+)(\d{3})/;
    while (r.test(number)) {
        number = number.replace(r, '$1,$2');
    }
    return number;
}
function spanLeadingZeroes4(n) {
    n = n.replace(/^(0{1,})([1-9]+)$/, '<span class="parse-error">$1</span>$2');
    n = n.replace(/^(0{1,})(0)$/, '<span class="parse-error">$1</span>$2');
    return n;
}
/*
 * A helper function to compact an array
 */
function compact(address, slice) {
    var s1 = [];
    var s2 = [];
    var i;
    for (i = 0; i < address.length; i++) {
        if (i < slice[0]) {
            s1.push(address[i]);
        }
        else if (i > slice[1]) {
            s2.push(address[i]);
        }
    }
    return s1.concat(['compact']).concat(s2);
}
function paddedHex(octet) {
    return sprintf_js_1.sprintf('%04x', parseInt(octet, 16));
}
function unsignByte(b) {
    // eslint-disable-next-line no-bitwise
    return b & 0xff;
}
/**
 * Represents an IPv6 address
 * @class Address6
 * @param {string} address - An IPv6 address string
 * @param {number} [groups=8] - How many octets to parse
 * @example
 * var address = new Address6('2001::/32');
 */
var Address6 = /** @class */ (function () {
    function Address6(address, optionalGroups) {
        this.addressMinusSuffix = '';
        this.parsedSubnet = '';
        this.subnet = '/128';
        this.subnetMask = 128;
        this.v4 = false;
        this.zone = '';
        // #region Attributes
        /**
         * Returns true if the given address is in the subnet of the current address
         * @memberof Address6
         * @instance
         * @returns {boolean}
         */
        this.isInSubnet = common.isInSubnet;
        /**
         * Returns true if the address is correct, false otherwise
         * @memberof Address6
         * @instance
         * @returns {boolean}
         */
        this.isCorrect = common.isCorrect(constants6.BITS);
        if (optionalGroups === undefined) {
            this.groups = constants6.GROUPS;
        }
        else {
            this.groups = optionalGroups;
        }
        this.address = address;
        var subnet = constants6.RE_SUBNET_STRING.exec(address);
        if (subnet) {
            this.parsedSubnet = subnet[0].replace('/', '');
            this.subnetMask = parseInt(this.parsedSubnet, 10);
            this.subnet = "/" + this.subnetMask;
            if (Number.isNaN(this.subnetMask) ||
                this.subnetMask < 0 ||
                this.subnetMask > constants6.BITS) {
                throw new address_error_1.AddressError('Invalid subnet mask.');
            }
            address = address.replace(constants6.RE_SUBNET_STRING, '');
        }
        else if (/\//.test(address)) {
            throw new address_error_1.AddressError('Invalid subnet mask.');
        }
        var zone = constants6.RE_ZONE_STRING.exec(address);
        if (zone) {
            this.zone = zone[0];
            address = address.replace(constants6.RE_ZONE_STRING, '');
        }
        this.addressMinusSuffix = address;
        this.parsedAddress = this.parse(this.addressMinusSuffix);
    }
    Address6.isValid = function (address) {
        try {
            // eslint-disable-next-line no-new
            new Address6(address);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    /**
     * Convert a BigInteger to a v6 address object
     * @memberof Address6
     * @static
     * @param {BigInteger} bigInteger - a BigInteger to convert
     * @returns {Address6}
     * @example
     * var bigInteger = new BigInteger('1000000000000');
     * var address = Address6.fromBigInteger(bigInteger);
     * address.correctForm(); // '::e8:d4a5:1000'
     */
    Address6.fromBigInteger = function (bigInteger) {
        var hex = bigInteger.toString(16).padStart(32, '0');
        var groups = [];
        var i;
        for (i = 0; i < constants6.GROUPS; i++) {
            groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return new Address6(groups.join(':'));
    };
    /**
     * Convert a URL (with optional port number) to an address object
     * @memberof Address6
     * @static
     * @param {string} url - a URL with optional port number
     * @example
     * var addressAndPort = Address6.fromURL('http://[ffff::]:8080/foo/');
     * addressAndPort.address.correctForm(); // 'ffff::'
     * addressAndPort.port; // 8080
     */
    Address6.fromURL = function (url) {
        var host;
        var port = null;
        var result;
        // If we have brackets parse them and find a port
        if (url.indexOf('[') !== -1 && url.indexOf(']:') !== -1) {
            result = constants6.RE_URL_WITH_PORT.exec(url);
            if (result === null) {
                return {
                    error: 'failed to parse address with port',
                    address: null,
                    port: null,
                };
            }
            host = result[1];
            port = result[2];
            // If there's a URL extract the address
        }
        else if (url.indexOf('/') !== -1) {
            // Remove the protocol prefix
            url = url.replace(/^[a-z0-9]+:\/\//, '');
            // Parse the address
            result = constants6.RE_URL.exec(url);
            if (result === null) {
                return {
                    error: 'failed to parse address from URL',
                    address: null,
                    port: null,
                };
            }
            host = result[1];
            // Otherwise just assign the URL to the host and let the library parse it
        }
        else {
            host = url;
        }
        // If there's a port convert it to an integer
        if (port) {
            port = parseInt(port, 10);
            // squelch out of range ports
            if (port < 0 || port > 65536) {
                port = null;
            }
        }
        else {
            // Standardize `undefined` to `null`
            port = null;
        }
        return {
            address: new Address6(host),
            port: port,
        };
    };
    /**
     * Create an IPv6-mapped address given an IPv4 address
     * @memberof Address6
     * @static
     * @param {string} address - An IPv4 address string
     * @returns {Address6}
     * @example
     * var address = Address6.fromAddress4('192.168.0.1');
     * address.correctForm(); // '::ffff:c0a8:1'
     * address.to4in6(); // '::ffff:192.168.0.1'
     */
    Address6.fromAddress4 = function (address) {
        var address4 = new ipv4_1.Address4(address);
        var mask6 = constants6.BITS - (constants4.BITS - address4.subnetMask);
        return new Address6("::ffff:" + address4.correctForm() + "/" + mask6);
    };
    /**
     * Return an address from ip6.arpa form
     * @memberof Address6
     * @static
     * @param {string} arpaFormAddress - an 'ip6.arpa' form address
     * @returns {Adress6}
     * @example
     * var address = Address6.fromArpa(e.f.f.f.3.c.2.6.f.f.f.e.6.6.8.e.1.0.6.7.9.4.e.c.0.0.0.0.1.0.0.2.ip6.arpa.)
     * address.correctForm(); // '2001:0:ce49:7601:e866:efff:62c3:fffe'
     */
    Address6.fromArpa = function (arpaFormAddress) {
        // remove ending ".ip6.arpa." or just "."
        var address = arpaFormAddress.replace(/(\.ip6\.arpa)?\.$/, '');
        var semicolonAmount = 7;
        // correct ip6.arpa form with ending removed will be 63 characters
        if (address.length !== 63) {
            throw new address_error_1.AddressError("Invalid 'ip6.arpa' form.");
        }
        var parts = address.split('.').reverse();
        for (var i = semicolonAmount; i > 0; i--) {
            var insertIndex = i * 4;
            parts.splice(insertIndex, 0, ':');
        }
        address = parts.join('');
        return new Address6(address);
    };
    /**
     * Return the Microsoft UNC transcription of the address
     * @memberof Address6
     * @instance
     * @returns {String} the Microsoft UNC transcription of the address
     */
    Address6.prototype.microsoftTranscription = function () {
        return sprintf_js_1.sprintf('%s.ipv6-literal.net', this.correctForm().replace(/:/g, '-'));
    };
    /**
     * Return the first n bits of the address, defaulting to the subnet mask
     * @memberof Address6
     * @instance
     * @param {number} [mask=subnet] - the number of bits to mask
     * @returns {String} the first n bits of the address as a string
     */
    Address6.prototype.mask = function (mask) {
        if (mask === void 0) { mask = this.subnetMask; }
        return this.getBitsBase2(0, mask);
    };
    /**
     * Return the number of possible subnets of a given size in the address
     * @memberof Address6
     * @instance
     * @param {number} [size=128] - the subnet size
     * @returns {String}
     */
    // TODO: probably useful to have a numeric version of this too
    Address6.prototype.possibleSubnets = function (subnetSize) {
        if (subnetSize === void 0) { subnetSize = 128; }
        var availableBits = constants6.BITS - this.subnetMask;
        var subnetBits = Math.abs(subnetSize - constants6.BITS);
        var subnetPowers = availableBits - subnetBits;
        if (subnetPowers < 0) {
            return '0';
        }
        return addCommas(new jsbn_1.BigInteger('2', 10).pow(subnetPowers).toString(10));
    };
    /**
     * Helper function getting start address.
     * @memberof Address6
     * @instance
     * @returns {BigInteger}
     */
    Address6.prototype._startAddress = function () {
        return new jsbn_1.BigInteger(this.mask() + '0'.repeat(constants6.BITS - this.subnetMask), 2);
    };
    /**
     * The first address in the range given by this address' subnet
     * Often referred to as the Network Address.
     * @memberof Address6
     * @instance
     * @returns {Address6}
     */
    Address6.prototype.startAddress = function () {
        return Address6.fromBigInteger(this._startAddress());
    };
    /**
     * The first host address in the range given by this address's subnet ie
     * the first address after the Network Address
     * @memberof Address6
     * @instance
     * @returns {Address6}
     */
    Address6.prototype.startAddressExclusive = function () {
        var adjust = new jsbn_1.BigInteger('1');
        return Address6.fromBigInteger(this._startAddress().add(adjust));
    };
    /**
     * Helper function getting end address.
     * @memberof Address6
     * @instance
     * @returns {BigInteger}
     */
    Address6.prototype._endAddress = function () {
        return new jsbn_1.BigInteger(this.mask() + '1'.repeat(constants6.BITS - this.subnetMask), 2);
    };
    /**
     * The last address in the range given by this address' subnet
     * Often referred to as the Broadcast
     * @memberof Address6
     * @instance
     * @returns {Address6}
     */
    Address6.prototype.endAddress = function () {
        return Address6.fromBigInteger(this._endAddress());
    };
    /**
     * The last host address in the range given by this address's subnet ie
     * the last address prior to the Broadcast Address
     * @memberof Address6
     * @instance
     * @returns {Address6}
     */
    Address6.prototype.endAddressExclusive = function () {
        var adjust = new jsbn_1.BigInteger('1');
        return Address6.fromBigInteger(this._endAddress().subtract(adjust));
    };
    /**
     * Return the scope of the address
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.getScope = function () {
        var scope = constants6.SCOPES[this.getBits(12, 16).intValue()];
        if (this.getType() === 'Global unicast' && scope !== 'Link local') {
            scope = 'Global';
        }
        return scope || 'Unknown';
    };
    /**
     * Return the type of the address
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.getType = function () {
        for (var _i = 0, _a = Object.keys(constants6.TYPES); _i < _a.length; _i++) {
            var subnet = _a[_i];
            if (this.isInSubnet(new Address6(subnet))) {
                return constants6.TYPES[subnet];
            }
        }
        return 'Global unicast';
    };
    /**
     * Return the bits in the given range as a BigInteger
     * @memberof Address6
     * @instance
     * @returns {BigInteger}
     */
    Address6.prototype.getBits = function (start, end) {
        return new jsbn_1.BigInteger(this.getBitsBase2(start, end), 2);
    };
    /**
     * Return the bits in the given range as a base-2 string
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.getBitsBase2 = function (start, end) {
        return this.binaryZeroPad().slice(start, end);
    };
    /**
     * Return the bits in the given range as a base-16 string
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.getBitsBase16 = function (start, end) {
        var length = end - start;
        if (length % 4 !== 0) {
            throw new Error('Length of bits to retrieve must be divisible by four');
        }
        return this.getBits(start, end)
            .toString(16)
            .padStart(length / 4, '0');
    };
    /**
     * Return the bits that are set past the subnet mask length
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.getBitsPastSubnet = function () {
        return this.getBitsBase2(this.subnetMask, constants6.BITS);
    };
    /**
     * Return the reversed ip6.arpa form of the address
     * @memberof Address6
     * @param {Object} options
     * @param {boolean} options.omitSuffix - omit the "ip6.arpa" suffix
     * @instance
     * @returns {String}
     */
    Address6.prototype.reverseForm = function (options) {
        if (!options) {
            options = {};
        }
        var characters = Math.floor(this.subnetMask / 4);
        var reversed = this.canonicalForm()
            .replace(/:/g, '')
            .split('')
            .slice(0, characters)
            .reverse()
            .join('.');
        if (characters > 0) {
            if (options.omitSuffix) {
                return reversed;
            }
            return sprintf_js_1.sprintf('%s.ip6.arpa.', reversed);
        }
        if (options.omitSuffix) {
            return '';
        }
        return 'ip6.arpa.';
    };
    /**
     * Return the correct form of the address
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.correctForm = function () {
        var i;
        var groups = [];
        var zeroCounter = 0;
        var zeroes = [];
        for (i = 0; i < this.parsedAddress.length; i++) {
            var value = parseInt(this.parsedAddress[i], 16);
            if (value === 0) {
                zeroCounter++;
            }
            if (value !== 0 && zeroCounter > 0) {
                if (zeroCounter > 1) {
                    zeroes.push([i - zeroCounter, i - 1]);
                }
                zeroCounter = 0;
            }
        }
        // Do we end with a string of zeroes?
        if (zeroCounter > 1) {
            zeroes.push([this.parsedAddress.length - zeroCounter, this.parsedAddress.length - 1]);
        }
        var zeroLengths = zeroes.map(function (n) { return n[1] - n[0] + 1; });
        if (zeroes.length > 0) {
            var index = zeroLengths.indexOf(Math.max.apply(Math, zeroLengths));
            groups = compact(this.parsedAddress, zeroes[index]);
        }
        else {
            groups = this.parsedAddress;
        }
        for (i = 0; i < groups.length; i++) {
            if (groups[i] !== 'compact') {
                groups[i] = parseInt(groups[i], 16).toString(16);
            }
        }
        var correct = groups.join(':');
        correct = correct.replace(/^compact$/, '::');
        correct = correct.replace(/^compact|compact$/, ':');
        correct = correct.replace(/compact/, '');
        return correct;
    };
    /**
     * Return a zero-padded base-2 string representation of the address
     * @memberof Address6
     * @instance
     * @returns {String}
     * @example
     * var address = new Address6('2001:4860:4001:803::1011');
     * address.binaryZeroPad();
     * // '0010000000000001010010000110000001000000000000010000100000000011
     * //  0000000000000000000000000000000000000000000000000001000000010001'
     */
    Address6.prototype.binaryZeroPad = function () {
        return this.bigInteger().toString(2).padStart(constants6.BITS, '0');
    };
    // TODO: Improve the semantics of this helper function
    Address6.prototype.parse4in6 = function (address) {
        var groups = address.split(':');
        var lastGroup = groups.slice(-1)[0];
        var address4 = lastGroup.match(constants4.RE_ADDRESS);
        if (address4) {
            this.parsedAddress4 = address4[0];
            this.address4 = new ipv4_1.Address4(this.parsedAddress4);
            for (var i = 0; i < this.address4.groups; i++) {
                if (/^0[0-9]+/.test(this.address4.parsedAddress[i])) {
                    throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.", address.replace(constants4.RE_ADDRESS, this.address4.parsedAddress.map(spanLeadingZeroes4).join('.')));
                }
            }
            this.v4 = true;
            groups[groups.length - 1] = this.address4.toGroup6();
            address = groups.join(':');
        }
        return address;
    };
    // TODO: Make private?
    Address6.prototype.parse = function (address) {
        address = this.parse4in6(address);
        var badCharacters = address.match(constants6.RE_BAD_CHARACTERS);
        if (badCharacters) {
            throw new address_error_1.AddressError(sprintf_js_1.sprintf('Bad character%s detected in address: %s', badCharacters.length > 1 ? 's' : '', badCharacters.join('')), address.replace(constants6.RE_BAD_CHARACTERS, '<span class="parse-error">$1</span>'));
        }
        var badAddress = address.match(constants6.RE_BAD_ADDRESS);
        if (badAddress) {
            throw new address_error_1.AddressError(sprintf_js_1.sprintf('Address failed regex: %s', badAddress.join('')), address.replace(constants6.RE_BAD_ADDRESS, '<span class="parse-error">$1</span>'));
        }
        var groups = [];
        var halves = address.split('::');
        if (halves.length === 2) {
            var first = halves[0].split(':');
            var last = halves[1].split(':');
            if (first.length === 1 && first[0] === '') {
                first = [];
            }
            if (last.length === 1 && last[0] === '') {
                last = [];
            }
            var remaining = this.groups - (first.length + last.length);
            if (!remaining) {
                throw new address_error_1.AddressError('Error parsing groups');
            }
            this.elidedGroups = remaining;
            this.elisionBegin = first.length;
            this.elisionEnd = first.length + this.elidedGroups;
            groups = groups.concat(first);
            for (var i = 0; i < remaining; i++) {
                groups.push('0');
            }
            groups = groups.concat(last);
        }
        else if (halves.length === 1) {
            groups = address.split(':');
            this.elidedGroups = 0;
        }
        else {
            throw new address_error_1.AddressError('Too many :: groups found');
        }
        groups = groups.map(function (group) { return sprintf_js_1.sprintf('%x', parseInt(group, 16)); });
        if (groups.length !== this.groups) {
            throw new address_error_1.AddressError('Incorrect number of groups found');
        }
        return groups;
    };
    /**
     * Return the canonical form of the address
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.canonicalForm = function () {
        return this.parsedAddress.map(paddedHex).join(':');
    };
    /**
     * Return the decimal form of the address
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.decimal = function () {
        return this.parsedAddress.map(function (n) { return sprintf_js_1.sprintf('%05d', parseInt(n, 16)); }).join(':');
    };
    /**
     * Return the address as a BigInteger
     * @memberof Address6
     * @instance
     * @returns {BigInteger}
     */
    Address6.prototype.bigInteger = function () {
        return new jsbn_1.BigInteger(this.parsedAddress.map(paddedHex).join(''), 16);
    };
    /**
     * Return the last two groups of this address as an IPv4 address string
     * @memberof Address6
     * @instance
     * @returns {Address4}
     * @example
     * var address = new Address6('2001:4860:4001::1825:bf11');
     * address.to4().correctForm(); // '24.37.191.17'
     */
    Address6.prototype.to4 = function () {
        var binary = this.binaryZeroPad().split('');
        return ipv4_1.Address4.fromHex(new jsbn_1.BigInteger(binary.slice(96, 128).join(''), 2).toString(16));
    };
    /**
     * Return the v4-in-v6 form of the address
     * @memberof Address6
     * @instance
     * @returns {String}
     */
    Address6.prototype.to4in6 = function () {
        var address4 = this.to4();
        var address6 = new Address6(this.parsedAddress.slice(0, 6).join(':'), 6);
        var correct = address6.correctForm();
        var infix = '';
        if (!/:$/.test(correct)) {
            infix = ':';
        }
        return correct + infix + address4.address;
    };
    /**
     * Return an object containing the Teredo properties of the address
     * @memberof Address6
     * @instance
     * @returns {Object}
     */
    Address6.prototype.inspectTeredo = function () {
        /*
        - Bits 0 to 31 are set to the Teredo prefix (normally 2001:0000::/32).
        - Bits 32 to 63 embed the primary IPv4 address of the Teredo server that
          is used.
        - Bits 64 to 79 can be used to define some flags. Currently only the
          higher order bit is used; it is set to 1 if the Teredo client is
          located behind a cone NAT, 0 otherwise. For Microsoft's Windows Vista
          and Windows Server 2008 implementations, more bits are used. In those
          implementations, the format for these 16 bits is "CRAAAAUG AAAAAAAA",
          where "C" remains the "Cone" flag. The "R" bit is reserved for future
          use. The "U" bit is for the Universal/Local flag (set to 0). The "G" bit
          is Individual/Group flag (set to 0). The A bits are set to a 12-bit
          randomly generated number chosen by the Teredo client to introduce
          additional protection for the Teredo node against IPv6-based scanning
          attacks.
        - Bits 80 to 95 contains the obfuscated UDP port number. This is the
          port number that is mapped by the NAT to the Teredo client with all
          bits inverted.
        - Bits 96 to 127 contains the obfuscated IPv4 address. This is the
          public IPv4 address of the NAT with all bits inverted.
        */
        var prefix = this.getBitsBase16(0, 32);
        var udpPort = this.getBits(80, 96).xor(new jsbn_1.BigInteger('ffff', 16)).toString();
        var server4 = ipv4_1.Address4.fromHex(this.getBitsBase16(32, 64));
        var client4 = ipv4_1.Address4.fromHex(this.getBits(96, 128).xor(new jsbn_1.BigInteger('ffffffff', 16)).toString(16));
        var flags = this.getBits(64, 80);
        var flagsBase2 = this.getBitsBase2(64, 80);
        var coneNat = flags.testBit(15);
        var reserved = flags.testBit(14);
        var groupIndividual = flags.testBit(8);
        var universalLocal = flags.testBit(9);
        var nonce = new jsbn_1.BigInteger(flagsBase2.slice(2, 6) + flagsBase2.slice(8, 16), 2).toString(10);
        return {
            prefix: sprintf_js_1.sprintf('%s:%s', prefix.slice(0, 4), prefix.slice(4, 8)),
            server4: server4.address,
            client4: client4.address,
            flags: flagsBase2,
            coneNat: coneNat,
            microsoft: {
                reserved: reserved,
                universalLocal: universalLocal,
                groupIndividual: groupIndividual,
                nonce: nonce,
            },
            udpPort: udpPort,
        };
    };
    /**
     * Return an object containing the 6to4 properties of the address
     * @memberof Address6
     * @instance
     * @returns {Object}
     */
    Address6.prototype.inspect6to4 = function () {
        /*
        - Bits 0 to 15 are set to the 6to4 prefix (2002::/16).
        - Bits 16 to 48 embed the IPv4 address of the 6to4 gateway that is used.
        */
        var prefix = this.getBitsBase16(0, 16);
        var gateway = ipv4_1.Address4.fromHex(this.getBitsBase16(16, 48));
        return {
            prefix: sprintf_js_1.sprintf('%s', prefix.slice(0, 4)),
            gateway: gateway.address,
        };
    };
    /**
     * Return a v6 6to4 address from a v6 v4inv6 address
     * @memberof Address6
     * @instance
     * @returns {Address6}
     */
    Address6.prototype.to6to4 = function () {
        if (!this.is4()) {
            return null;
        }
        var addr6to4 = [
            '2002',
            this.getBitsBase16(96, 112),
            this.getBitsBase16(112, 128),
            '',
            '/16',
        ].join(':');
        return new Address6(addr6to4);
    };
    /**
     * Return a byte array
     * @memberof Address6
     * @instance
     * @returns {Array}
     */
    Address6.prototype.toByteArray = function () {
        var byteArray = this.bigInteger().toByteArray();
        // work around issue where `toByteArray` returns a leading 0 element
        if (byteArray.length === 17 && byteArray[0] === 0) {
            return byteArray.slice(1);
        }
        return byteArray;
    };
    /**
     * Return an unsigned byte array
     * @memberof Address6
     * @instance
     * @returns {Array}
     */
    Address6.prototype.toUnsignedByteArray = function () {
        return this.toByteArray().map(unsignByte);
    };
    /**
     * Convert a byte array to an Address6 object
     * @memberof Address6
     * @static
     * @returns {Address6}
     */
    Address6.fromByteArray = function (bytes) {
        return this.fromUnsignedByteArray(bytes.map(unsignByte));
    };
    /**
     * Convert an unsigned byte array to an Address6 object
     * @memberof Address6
     * @static
     * @returns {Address6}
     */
    Address6.fromUnsignedByteArray = function (bytes) {
        var BYTE_MAX = new jsbn_1.BigInteger('256', 10);
        var result = new jsbn_1.BigInteger('0', 10);
        var multiplier = new jsbn_1.BigInteger('1', 10);
        for (var i = bytes.length - 1; i >= 0; i--) {
            result = result.add(multiplier.multiply(new jsbn_1.BigInteger(bytes[i].toString(10), 10)));
            multiplier = multiplier.multiply(BYTE_MAX);
        }
        return Address6.fromBigInteger(result);
    };
    /**
     * Returns true if the address is in the canonical form, false otherwise
     * @memberof Address6
     * @instance
     * @returns {boolean}
     */
    Address6.prototype.isCanonical = function () {
        return this.addressMinusSuffix === this.canonicalForm();
    };
    /**
     * Returns true if the address is a link local address, false otherwise
     * @memberof Address6
     * @instance
     * @returns {boolean}
     */
    Address6.prototype.isLinkLocal = function () {
        // Zeroes are required, i.e. we can't check isInSubnet with 'fe80::/10'
        if (this.getBitsBase2(0, 64) ===
            '1111111010000000000000000000000000000000000000000000000000000000') {
            return true;
        }
        return false;
    };
    /**
     * Returns true if the address is a multicast address, false otherwise
     * @memberof Address6
     * @instance
     * @returns {boolean}
     */
    Address6.prototype.isMulticast = function () {
        return this.getType() === 'Multicast';
    };
    /**
     * Returns true if the address is a v4-in-v6 address, false otherwise
     * @memberof Address6
     * @instance
     * @returns {boolean}
     */
    Address6.prototype.is4 = function () {
        return this.v4;
    };
    /**
     * Returns true if the address is a Teredo address, false otherwise
     * @memberof Address6
     * @instance
     * @returns {boolean}
     */
    Address6.prototype.isTeredo = function () {
        return this.isInSubnet(new Address6('2001::/32'));
    };
    /**
     * Returns true if the address is a 6to4 address, false otherwise
     * @memberof Address6
     * @instance
     * @returns {boolean}
     */
    Address6.prototype.is6to4 = function () {
        return this.isInSubnet(new Address6('2002::/16'));
    };
    /**
     * Returns true if the address is a loopback address, false otherwise
     * @memberof Address6
     * @instance
     * @returns {boolean}
     */
    Address6.prototype.isLoopback = function () {
        return this.getType() === 'Loopback';
    };
    // #endregion
    // #region HTML
    /**
     * @returns {String} the address in link form with a default port of 80
     */
    Address6.prototype.href = function (optionalPort) {
        if (optionalPort === undefined) {
            optionalPort = '';
        }
        else {
            optionalPort = sprintf_js_1.sprintf(':%s', optionalPort);
        }
        return sprintf_js_1.sprintf('http://[%s]%s/', this.correctForm(), optionalPort);
    };
    /**
     * @returns {String} a link suitable for conveying the address via a URL hash
     */
    Address6.prototype.link = function (options) {
        if (!options) {
            options = {};
        }
        if (options.className === undefined) {
            options.className = '';
        }
        if (options.prefix === undefined) {
            options.prefix = '/#address=';
        }
        if (options.v4 === undefined) {
            options.v4 = false;
        }
        var formFunction = this.correctForm;
        if (options.v4) {
            formFunction = this.to4in6;
        }
        if (options.className) {
            return sprintf_js_1.sprintf('<a href="%1$s%2$s" class="%3$s">%2$s</a>', options.prefix, formFunction.call(this), options.className);
        }
        return sprintf_js_1.sprintf('<a href="%1$s%2$s">%2$s</a>', options.prefix, formFunction.call(this));
    };
    /**
     * Groups an address
     * @returns {String}
     */
    Address6.prototype.group = function () {
        if (this.elidedGroups === 0) {
            // The simple case
            return helpers.simpleGroup(this.address).join(':');
        }
        assert(typeof this.elidedGroups === 'number');
        assert(typeof this.elisionBegin === 'number');
        // The elided case
        var output = [];
        var _a = this.address.split('::'), left = _a[0], right = _a[1];
        if (left.length) {
            output.push.apply(output, helpers.simpleGroup(left));
        }
        else {
            output.push('');
        }
        var classes = ['hover-group'];
        for (var i = this.elisionBegin; i < this.elisionBegin + this.elidedGroups; i++) {
            classes.push(sprintf_js_1.sprintf('group-%d', i));
        }
        output.push(sprintf_js_1.sprintf('<span class="%s"></span>', classes.join(' ')));
        if (right.length) {
            output.push.apply(output, helpers.simpleGroup(right, this.elisionEnd));
        }
        else {
            output.push('');
        }
        if (this.is4()) {
            assert(this.address4 instanceof ipv4_1.Address4);
            output.pop();
            output.push(this.address4.groupForV6());
        }
        return output.join(':');
    };
    // #endregion
    // #region Regular expressions
    /**
     * Generate a regular expression string that can be used to find or validate
     * all variations of this address
     * @memberof Address6
     * @instance
     * @param {boolean} substringSearch
     * @returns {string}
     */
    Address6.prototype.regularExpressionString = function (substringSearch) {
        if (substringSearch === void 0) { substringSearch = false; }
        var output = [];
        // TODO: revisit why this is necessary
        var address6 = new Address6(this.correctForm());
        if (address6.elidedGroups === 0) {
            // The simple case
            output.push(regular_expressions_1.simpleRegularExpression(address6.parsedAddress));
        }
        else if (address6.elidedGroups === constants6.GROUPS) {
            // A completely elided address
            output.push(regular_expressions_1.possibleElisions(constants6.GROUPS));
        }
        else {
            // A partially elided address
            var halves = address6.address.split('::');
            if (halves[0].length) {
                output.push(regular_expressions_1.simpleRegularExpression(halves[0].split(':')));
            }
            assert(typeof address6.elidedGroups === 'number');
            output.push(regular_expressions_1.possibleElisions(address6.elidedGroups, halves[0].length !== 0, halves[1].length !== 0));
            if (halves[1].length) {
                output.push(regular_expressions_1.simpleRegularExpression(halves[1].split(':')));
            }
            output = [output.join(':')];
        }
        if (!substringSearch) {
            output = __spreadArrays([
                '(?=^|',
                regular_expressions_1.ADDRESS_BOUNDARY,
                '|[^\\w\\:])('
            ], output, [
                ')(?=[^\\w\\:]|',
                regular_expressions_1.ADDRESS_BOUNDARY,
                '|$)',
            ]);
        }
        return output.join('');
    };
    /**
     * Generate a regular expression that can be used to find or validate all
     * variations of this address.
     * @memberof Address6
     * @instance
     * @param {boolean} substringSearch
     * @returns {RegExp}
     */
    Address6.prototype.regularExpression = function (substringSearch) {
        if (substringSearch === void 0) { substringSearch = false; }
        return new RegExp(this.regularExpressionString(substringSearch), 'i');
    };
    return Address6;
}());
exports.Address6 = Address6;
//# sourceMappingURL=ipv6.js.map