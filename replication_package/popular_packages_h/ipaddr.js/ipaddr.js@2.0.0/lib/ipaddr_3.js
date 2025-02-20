(function (root) {
    'use strict';

    // Define regular expression patterns for IP address validation
    const ipv4Part = '(0?\\d+|0x[a-f0-9]+)';
    const ipv4Regexes = {
        fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, 'i'),
        longValue: new RegExp(`^${ipv4Part}$`, 'i')
    };

    const octalRegex = new RegExp(`^0[0-7]+$`, 'i');
    const hexRegex = new RegExp(`^0x[a-f0-9]+$`, 'i');

    const zoneIndex = '%[0-9a-z]{1,}';
    const ipv6Part = '(?:[0-9a-f]+::?)+';
    const ipv6Regexes = {
        zoneIndex: new RegExp(zoneIndex, 'i'),
        native: new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`, 'i'),
        deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`, 'i'),
        transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`, 'i')
    };

    // Function to expand shortened IPv6 addresses
    function expandIPv6(string, parts) {
        if (string.indexOf('::') !== string.lastIndexOf('::')) {
            return null;
        }

        let colonCount = 0;
        let lastColon = -1;
        let zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0];

        if (zoneId) {
            zoneId = zoneId.substring(1);
            string = string.replace(/%.+$/, '');
        }

        while ((lastColon = string.indexOf(':', lastColon + 1)) >= 0) {
            colonCount++;
        }

        if (string.startsWith('::') || string.endsWith('::')) {
            colonCount--;
        }
        if (colonCount > parts) {
            return null;
        }

        const replacement = ':'.repeat(parts - colonCount).split('.').join(':0:');
        string = string.replace('::', replacement).replace(/^:|:$/g, '');

        return {
            parts: string.split(':').map(part => parseInt(part, 16)),
            zoneId: zoneId
        };
    }

    // Check CIDR range match
    function matchCIDR(first, second, partSize, cidrBits) {
        if (first.length !== second.length) {
            throw new Error('ipaddr: cannot match CIDR for objects with different lengths');
        }

        let part = 0;

        while (cidrBits > 0) {
            const shift = Math.max(0, partSize - cidrBits);
            if (first[part] >> shift !== second[part] >> shift) {
                return false;
            }
            cidrBits -= partSize;
            part += 1;
        }

        return true;
    }

    // Utility to parse integers from strings with auto-detected base (dec, hex, octal)
    function parseIntAuto(string) {
        if (hexRegex.test(string)) {
            return parseInt(string, 16);
        }
        if (string[0] === '0' && !isNaN(parseInt(string[1], 10))) {
            if (octalRegex.test(string)) {
                return parseInt(string, 8);
            }
            throw new Error(`ipaddr: cannot parse ${string} as octal`);
        }
        return parseInt(string, 10);
    }

    // Main IP address utility object
    const ipaddr = {};

    ipaddr.IPv4 = (function () {
        function IPv4(octets) {
            if (octets.length !== 4) {
                throw new Error('ipaddr: ipv4 octet count should be 4');
            }

            for (const octet of octets) {
                if (!(0 <= octet && octet <= 255)) {
                    throw new Error('ipaddr: ipv4 octet should fit in 8 bits');
                }
            }

            this.octets = octets;
        }

        // Define IPv4 special ranges and methods for processing
        IPv4.prototype.SpecialRanges = {
            unspecified: [[new IPv4([0, 0, 0, 0]), 8]],
            broadcast: [[new IPv4([255, 255, 255, 255]), 32]],
            multicast: [[new IPv4([224, 0, 0, 0]), 4]],
            linkLocal: [[new IPv4([169, 254, 0, 0]), 16]],
            loopback: [[new IPv4([127, 0, 0, 0]), 8]],
            carrierGradeNat: [[new IPv4([100, 64, 0, 0]), 10]],
            private: [
                [new IPv4([10, 0, 0, 0]), 8],
                [new IPv4([172, 16, 0, 0]), 12],
                [new IPv4([192, 168, 0, 0]), 16]
            ],
            reserved: [
                [new IPv4([192, 0, 0, 0]), 24],
                [new IPv4([192, 0, 2, 0]), 24],
                [new IPv4([192, 88, 99, 0]), 24],
                [new IPv4([198, 51, 100, 0]), 24],
                [new IPv4([203, 0, 113, 0]), 24],
                [new IPv4([240, 0, 0, 0]), 4]
            ]
        };

        IPv4.prototype.kind = function () {
            return 'ipv4';
        };

        IPv4.prototype.match = function (other, cidrRange) {
            if (cidrRange === undefined) {
                [other, cidrRange] = other;
            }

            if (other.kind() !== 'ipv4') {
                throw new Error('ipaddr: cannot match ipv4 address with non-ipv4 one');
            }

            return matchCIDR(this.octets, other.octets, 8, cidrRange);
        };

        IPv4.prototype.prefixLengthFromSubnetMask = function () {
            const zerotable = {
                0: 8, 128: 7, 192: 6, 224: 5,
                240: 4, 248: 3, 252: 2, 254: 1, 255: 0
            };

            let cidr = 0;
            let stop = false;

            for (const octet of this.octets.reverse()) {
                if (octet in zerotable) {
                    const zeros = zerotable[octet];
                    if (stop && zeros !== 0) return null;
                    if (zeros !== 8) stop = true;
                    cidr += zeros;
                } else {
                    return null;
                }
            }

            return 32 - cidr;
        };

        IPv4.prototype.range = function () {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        };

        IPv4.prototype.toByteArray = function () {
            return this.octets.slice(0);
        };

        IPv4.prototype.toIPv4MappedAddress = function () {
            return ipaddr.IPv6.parse(`::ffff:${this.toString()}`);
        };

        IPv4.prototype.toNormalizedString = function () {
            return this.toString();
        };

        IPv4.prototype.toString = function () {
            return this.octets.join('.');
        };

        // Utility functions such as broadcast and network address calculations
        IPv4.broadcastAddressFromCIDR = function (string) {
            try {
                const cidr = this.parseCIDR(string);
                const ipInterfaceOctets = cidr[0].toByteArray();
                const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();

                const octets = ipInterfaceOctets.map((octet, i) => {
                    return octet | (subnetMaskOctets[i] ^ 255);
                });

                return new this(octets);
            } catch {
                throw new Error('ipaddr: the address does not have IPv4 CIDR format');
            }
        };

        IPv4.isIPv4 = function (string) {
            return this.parser(string) !== null;
        };

        IPv4.isValid = function (string) {
            try {
                new this(this.parser(string));
                return true;
            } catch {
                return false;
            }
        };

        IPv4.isValidFourPartDecimal = function (string) {
            return ipaddr.IPv4.isValid(string) && /^\d+\.\d+\.\d+\.\d+$/.test(string);
        };

        IPv4.networkAddressFromCIDR = function (string) {
            try {
                const cidr = this.parseCIDR(string);
                const ipInterfaceOctets = cidr[0].toByteArray();
                const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();

                const octets = ipInterfaceOctets.map((octet, i) => {
                    return octet & subnetMaskOctets[i];
                });

                return new this(octets);
            } catch {
                throw new Error('ipaddr: the address does not have IPv4 CIDR format');
            }
        };

        IPv4.parse = function (string) {
            const parts = this.parser(string);
            if (!parts) {
                throw new Error('ipaddr: string is not formatted like an IPv4 Address');
            }
            return new this(parts);
        };

        IPv4.parseCIDR = function (string) {
            const match = string.match(/^(.+)\/(\d+)$/);
            if (match) {
                const maskLength = parseInt(match[2], 10);
                if (maskLength >= 0 && maskLength <= 32) {
                    const parsed = [this.parse(match[1]), maskLength];
                    Object.defineProperty(parsed, 'toString', {
                        value: function () {
                            return this.join('/');
                        }
                    });
                    return parsed;
                }
            }
            throw new Error('ipaddr: string is not formatted like an IPv4 CIDR range');
        };

        IPv4.parser = function (string) {
            let match, value;

            if ((match = string.match(ipv4Regexes.fourOctet))) {
                return match.slice(1).map(part => parseIntAuto(part));
            }
            if ((match = string.match(ipv4Regexes.longValue))) {
                value = parseIntAuto(match[1]);
                if (value > 0xffffffff || value < 0) {
                    throw new Error('ipaddr: address outside defined range');
                }
                return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
            }
            if ((match = string.match(ipv4Regexes.twoOctet))) {
                value = parseIntAuto(match[2]);
                if (value > 0xffffff || value < 0) {
                    throw new Error('ipaddr: address outside defined range');
                }
                return [parseIntAuto(match[1]), (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            }
            if ((match = string.match(ipv4Regexes.threeOctet))) {
                value = parseIntAuto(match[3]);
                if (value > 0xffff || value < 0) {
                    throw new Error('ipaddr: address outside defined range');
                }
                return [parseIntAuto(match[1]), parseIntAuto(match[2]), (value >> 8) & 0xff, value & 0xff];
            }
            return null;
        };

        IPv4.subnetMaskFromPrefixLength = function (prefix) {
            prefix = parseInt(prefix, 10);
            if (prefix < 0 || prefix > 32) {
                throw new Error('ipaddr: invalid IPv4 prefix length');
            }

            return new this([
                (prefix >= 8 ? 255 : Math.pow(2, prefix) - 1) << (8 - Math.min(prefix, 8)),
                (prefix >= 16 ? 255 : Math.pow(2, prefix - 8) - 1) << (16 - Math.min(prefix, 16)),
                (prefix >= 24 ? 255 : Math.pow(2, prefix - 16) - 1) << (24 - Math.min(prefix, 24)),
                (prefix >= 32 ? 255 : Math.pow(2, prefix - 24) - 1) << (32 - Math.min(prefix, 32))
            ]);
        };

        return IPv4;
    })();

    ipaddr.IPv6 = (function () {
        function IPv6(parts, zoneId) {
            if (parts.length === 16) {
                this.parts = [];
                for (let i = 0; i <= 14; i += 2) {
                    this.parts.push((parts[i] << 8) | parts[i + 1]);
                }
            } else if (parts.length === 8) {
                this.parts = parts;
            } else {
                throw new Error('ipaddr: ipv6 part count should be 8 or 16');
            }

            for (const part of this.parts) {
                if (!(0 <= part && part <= 0xffff)) {
                    throw new Error('ipaddr: ipv6 part should fit in 16 bits');
                }
            }

            if (zoneId) {
                this.zoneId = zoneId;
            }
        }

        IPv6.prototype.SpecialRanges = {
            unspecified: [new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128],
            linkLocal: [new IPv6([0xfe80, 0, 0, 0, 0, 0, 0, 0]), 10],
            multicast: [new IPv6([0xff00, 0, 0, 0, 0, 0, 0, 0]), 8],
            loopback: [new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128],
            uniqueLocal: [new IPv6([0xfc00, 0, 0, 0, 0, 0, 0, 0]), 7],
            ipv4Mapped: [new IPv6([0, 0, 0, 0, 0, 0xffff, 0, 0]), 96],
            rfc6145: [new IPv6([0, 0, 0, 0, 0xffff, 0, 0, 0]), 96],
            rfc6052: [new IPv6([0x64, 0xff9b, 0, 0, 0, 0, 0, 0]), 96],
            '6to4': [new IPv6([0x2002, 0, 0, 0, 0, 0, 0, 0]), 16],
            teredo: [new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 32],
            reserved: [[new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32]]
        };

        IPv6.prototype.isIPv4MappedAddress = function () {
            return this.range() === 'ipv4Mapped';
        };

        IPv6.prototype.kind = function () {
            return 'ipv6';
        };

        IPv6.prototype.match = function (other, cidrRange) {
            if (cidrRange === undefined) {
                [other, cidrRange] = other;
            }

            if (other.kind() !== 'ipv6') {
                throw new Error('ipaddr: cannot match ipv6 address with non-ipv6 one');
            }

            return matchCIDR(this.parts, other.parts, 16, cidrRange);
        };

        IPv6.prototype.prefixLengthFromSubnetMask = function () {
            const zerotable = {
                0: 16, 32768: 15, 49152: 14, 57344: 13, 61440: 12, 63488: 11,
                64512: 10, 65024: 9, 65280: 8, 65408: 7, 65472: 6, 65504: 5,
                65520: 4, 65528: 3, 65532: 2, 65534: 1, 65535: 0
            };

            let cidr = 0;
            let stop = false;

            for (const part of this.parts.reverse()) {
                if (part in zerotable) {
                    const zeros = zerotable[part];
                    if (stop && zeros !== 0) return null;
                    if (zeros !== 16) stop = true;
                    cidr += zeros;
                } else {
                    return null;
                }
            }

            return 128 - cidr;
        };

        IPv6.prototype.range = function () {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        };

        IPv6.prototype.toByteArray = function () {
            const bytes = [];
            for (const part of this.parts) {
                bytes.push(part >> 8);
                bytes.push(part & 0xff);
            }
            return bytes;
        };

        IPv6.prototype.toFixedLengthString = function () {
            const addr = this.parts.map(part => padPart(part.toString(16), 4)).join(':');
            return addr + (this.zoneId ? `%${this.zoneId}` : '');
        };

        IPv6.prototype.toIPv4Address = function () {
            if (!this.isIPv4MappedAddress()) {
                throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
            }
            const ref = this.parts.slice(-2);
            return new ipaddr.IPv4([ref[0] >> 8, ref[0] & 0xff, ref[1] >> 8, ref[1] & 0xff]);
        };

        IPv6.prototype.toNormalizedString = function () {
            const addr = this.parts.map(part => part.toString(16)).join(':');
            return addr + (this.zoneId ? `%${this.zoneId}` : '');
        };

        IPv6.prototype.toRFC5952String = function () {
            const string = this.toNormalizedString();
            const match = string.match(/((^|:)(0(:|$)){2,})/g);
            let bestMatchIndex = 0;
            let bestMatchLength = -1;

            if (match) {
                for (const m of match) {
                    if (m.length > bestMatchLength) {
                        bestMatchIndex = string.indexOf(m);
                        bestMatchLength = m.length;
                    }
                }
            }

            if (bestMatchLength < 0) {
                return string;
            }

            const part1 = string.slice(0, bestMatchIndex);
            const part2 = string.slice(bestMatchIndex + bestMatchLength);
            return `${part1}::${part2}`;
        };

        IPv6.prototype.toString = function () {
            return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, '::');
        };

        return IPv6;
    })();

    ipaddr.IPv6.isIPv6 = function (string) {
        return this.parser(string) !== null;
    };

    ipaddr.IPv6.isValid = function (string) {
        if (typeof string === 'string' && string.indexOf(':') === -1) {
            return false;
        }

        try {
            const addr = this.parser(string);
            new this(addr.parts, addr.zoneId);
            return true;
        } catch {
            return false;
        }
    };

    ipaddr.IPv6.parse = function (string) {
        const addr = this.parser(string);
        if (addr.parts === null) {
            throw new Error('ipaddr: string is not formatted like an IPv6 Address');
        }
        return new this(addr.parts, addr.zoneId);
    };

    ipaddr.IPv6.parseCIDR = function (string) {
        const match = string.match(/^(.+)\/(\d+)$/);
        if (match) {
            const maskLength = parseInt(match[2], 10);
            if (maskLength >= 0 && maskLength <= 128) {
                const parsed = [this.parse(match[1]), maskLength];
                Object.defineProperty(parsed, 'toString', {
                    value: function () {
                        return this.join('/');
                    }
                });
                return parsed;
            }
        }
        throw new Error('ipaddr: string is not formatted like an IPv6 CIDR range');
    };

    ipaddr.IPv6.parser = function (string) {
        if (ipv6Regexes.deprecatedTransitional.test(string)) {
            return this.parser(string.replace(/^(?:::)/, "::ffff:"));
        }

        if (ipv6Regexes.native.test(string)) {
            return expandIPv6(string, 8);
        }

        const match = string.match(ipv6Regexes.transitional);
        if (match) {
            const zoneId = match[6] || '';
            const addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
            if (addr.parts) {
                addr.parts.push((parseInt(match[2], 10) << 8) | parseInt(match[3], 10));
                addr.parts.push((parseInt(match[4], 10) << 8) | parseInt(match[5], 10));
                return {
                    parts: addr.parts,
                    zoneId: addr.zoneId
                };
            }
        }
        return null;
    };

    ipaddr.fromByteArray = function (bytes) {
        const length = bytes.length;
        if (length === 4) {
            return new ipaddr.IPv4(bytes);
        }
        if (length === 16) {
            return new ipaddr.IPv6(bytes);
        }
        throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
    };

    ipaddr.isValid = function (string) {
        return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
    };

    ipaddr.parse = function (string) {
        if (ipaddr.IPv6.isValid(string)) {
            return ipaddr.IPv6.parse(string);
        }
        if (ipaddr.IPv4.isValid(string)) {
            return ipaddr.IPv4.parse(string);
        }
        throw new Error('ipaddr: the address has neither IPv6 nor IPv4 format');
    };

    ipaddr.parseCIDR = function (string) {
        try {
            return ipaddr.IPv6.parseCIDR(string);
        } catch {
            try {
                return ipaddr.IPv4.parseCIDR(string);
            } catch {
                throw new Error('ipaddr: the address has neither IPv6 nor IPv4 CIDR format');
            }
        }
    };

    ipaddr.process = function (string) {
        const addr = this.parse(string);
        if (addr.kind() === 'ipv6' && addr.isIPv4MappedAddress()) {
            return addr.toIPv4Address();
        }
        return addr;
    };

    ipaddr.subnetMatch = function (address, rangeList, defaultName) {
        defaultName = defaultName || 'unicast';

        for (const [rangeName, rangeSubnets] of Object.entries(rangeList)) {
            const subnets = (Array.isArray(rangeSubnets[0]) ? rangeSubnets : [rangeSubnets]);

            for (const subnet of subnets) {
                if (address.kind() === subnet[0].kind() && address.match.apply(address, subnet)) {
                    return rangeName;
                }
            }
        }

        return defaultName;
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ipaddr;
    } else {
        root.ipaddr = ipaddr;
    }

}(this));
