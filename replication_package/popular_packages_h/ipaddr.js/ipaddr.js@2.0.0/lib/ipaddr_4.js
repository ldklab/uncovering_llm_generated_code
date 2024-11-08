(function (root) {
    'use strict';

    // Define regular expressions for parsing IPv4 addresses
    const ipv4Part = '(0?\\d+|0x[a-f0-9]+)';
    const ipv4Regexes = {
        fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, 'i'),
        longValue: new RegExp(`^${ipv4Part}$`, 'i')
    };

    // Regular expressions for octal and hexadecimal numbers
    const octalRegex = /^0[0-7]+$/i;
    const hexRegex = /^0x[a-f0-9]+$/i;

    // Define regular expressions for parsing IPv6 addresses
    const zoneIndex = '%[0-9a-z]{1,}';
    const ipv6Part = '(?:[0-9a-f]+::?)+';
    const ipv6Regexes = {
        zoneIndex: new RegExp(zoneIndex, 'i'),
        native: new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`, 'i'),
        deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`, 'i'),
        transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`, 'i')
    };

    // Function to expand abbreviated IPv6 addresses
    function expandIPv6(string, parts) {
        if (string.indexOf('::') !== string.lastIndexOf('::')) {
            return null;
        }

        let colonCount = 0;
        let lastColon = -1;
        let zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0]?.substring(1);
        let replacement, replacementCount;

        string = string.replace(/%.+$/, '');

        while ((lastColon = string.indexOf(':', lastColon + 1)) >= 0) {
            colonCount++;
        }

        if (string.startsWith('::')) {
            colonCount--;
        }

        if (string.endsWith('::')) {
            colonCount--;
        }

        if (colonCount > parts) {
            return null;
        }

        replacementCount = parts - colonCount;
        replacement = ':';
        while (replacementCount--) {
            replacement += '0:';
        }

        string = string.replace('::', replacement).replace(/^:|:$/g, '');

        return {
            parts: string.split(':').map(part => parseInt(part, 16)),
            zoneId: zoneId
        };
    }

    // Function to match addresses against a CIDR range
    function matchCIDR(first, second, partSize, cidrBits) {
        if (first.length !== second.length) {
            throw new Error('ipaddr: cannot match CIDR for objects with different lengths');
        }

        let part = 0;
        while (cidrBits > 0) {
            const shift = Math.max(partSize - cidrBits, 0);
            if ((first[part] >> shift) !== (second[part] >> shift)) {
                return false;
            }
            cidrBits -= partSize;
            part++;
        }

        return true;
    }

    // Utility function to parse integer based on detected base
    function parseIntAuto(string) {
        if (hexRegex.test(string)) {
            return parseInt(string, 16);
        }
        if (octalRegex.test(string)) {
            return parseInt(string, 8);
        }
        return parseInt(string, 10);
    }

    // Function to pad parts with leading zeros
    function padPart(part, length) {
        return part.padStart(length, '0');
    }

    const ipaddr = {};

    // IPv4 class and associated methods
    ipaddr.IPv4 = (function () {
        function IPv4(octets) {
            if (octets.length !== 4 || octets.some(octet => octet < 0 || octet > 255)) {
                throw new Error('ipaddr: invalid IPv4 octet(s)');
            }
            this.octets = octets;
        }

        IPv4.prototype.SpecialRanges = {
            unspecified: [[new IPv4([0, 0, 0, 0]), 8]],
            broadcast: [[new IPv4([255, 255, 255, 255]), 32]],
            multicast: [[new IPv4([224, 0, 0, 0]), 4]],
            linkLocal: [[new IPv4([169, 254, 0, 0]), 16]],
            loopback: [[new IPv4([127, 0, 0, 0]), 8]],
            'private': [
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
            const zerotable = { 0: 8, 128: 7, 192: 6, 224: 5, 240: 4, 248: 3, 252: 2, 254: 1, 255: 0 };
            let cidr = 0;
            let stop = false;

            for (let i = 3; i >= 0; i -= 1) {
                const octet = this.octets[i];
                const zeros = zerotable[octet];
                if (stop && zeros !== 0) return null;
                if (zeros !== 8) stop = true;
                cidr += zeros;
            }

            return 32 - cidr;
        };

        IPv4.prototype.range = function () {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        };

        IPv4.prototype.toByteArray = function () {
            return this.octets.slice();
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

        return IPv4;
    })();

    ipaddr.IPv4.broadcastAddressFromCIDR = function (string) {
        try {
            const [addr, cidr] = this.parseCIDR(string);
            return addr.broadcastAddressFromCIDR(cidr);
        } catch {
            throw new Error('ipaddr: invalid IPv4 CIDR format');
        }
    };

    ipaddr.IPv4.isIPv4 = function (string) {
        return this.parser(string) !== null;
    };

    ipaddr.IPv4.isValid = function (string) {
        return this.parser(string) !== null;
    };

    ipaddr.IPv4.isValidFourPartDecimal = function (string) {
        return this.isValid(string) && /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(string);
    };

    ipaddr.IPv4.networkAddressFromCIDR = function (string) {
        try {
            const [addr, cidr] = this.parseCIDR(string);
            return addr.networkAddressFromCIDR(cidr);
        } catch {
            throw new Error('ipaddr: invalid IPv4 CIDR format');
        }
    };

    ipaddr.IPv4.parse = function (string) {
        const parts = this.parser(string);
        if (parts === null) throw new Error('ipaddr: string is not formatted like an IPv4 Address');
        return new this(parts);
    };

    ipaddr.IPv4.parseCIDR = function (string) {
        const match = string.match(/^(.+)\/(\d+)$/);
        if (match) {
            const prefix = parseInt(match[2], 10);
            if (prefix >= 0 && prefix <= 32) {
                return [this.parse(match[1]), prefix];
            }
        }
        throw new Error('ipaddr: string is not formatted like an IPv4 CIDR range');
    };

    ipaddr.IPv4.parser = function (string) {
        let match, part, value;

        if ((match = string.match(ipv4Regexes.fourOctet))) {
            return match.slice(1, 5).map(parseIntAuto);
        } else if ((match = string.match(ipv4Regexes.longValue))) {
            value = parseIntAuto(match[1]);
            if (value > 0xffffffff || value < 0) throw new Error('ipaddr: address outside defined range');
            return new Array(4).fill().map((_, i) => (value >> (24 - i * 8)) & 0xff);
        } else if ((match = string.match(ipv4Regexes.twoOctet))) {
            value = parseIntAuto(match[2]);
            if (value > 0xffffff || value < 0) throw new Error('ipaddr: address outside defined range');
            return [parseIntAuto(match[1]), ...[0x10000, 0x100, 1].map(msk => (value >> msk) & 0xff)];
        } else if ((match = string.match(ipv4Regexes.threeOctet))) {
            value = parseIntAuto(match[3]);
            if (value > 0xffff || value < 0) throw new Error('ipaddr: address outside defined range');
            return [...match.slice(1, 3).map(parseIntAuto), (value >> 8) & 0xff, value & 0xff];
        }

        return null;
    };

    ipaddr.IPv4.subnetMaskFromPrefixLength = function (prefix) {
        if (prefix < 0 || prefix > 32) throw new Error('ipaddr: invalid IPv4 prefix length');
        return new this(new Array(4).fill().map((_, i) => (prefix >= (i + 1) * 8 ? 255 : Math.max(0, (0xff << (8 - prefix % 8)) & 0xff))));
    };

    // IPv6 class and associated methods
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

            if (!this.parts.every(part => 0 <= part && part <= 0xffff)) {
                throw new Error('ipaddr: ipv6 part should fit in 16 bits');
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
            reserved: [new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32]
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
            const zerotable = { 0: 16, 32768: 15, 49152: 14, 57344: 13, 61440: 12, 63488: 11, 64512: 10, 65024: 9, 65280: 8, 65408: 7, 65472: 6, 65504: 5, 65520: 4, 65528: 3, 65532: 2, 65534: 1, 65535: 0 };
            let cidr = 0;
            let stop = false;

            for (let i = 7; i >= 0; i -= 1) {
                const part = this.parts[i];
                const zeros = zerotable[part];
                if (stop && zeros !== 0) return null;
                if (zeros !== 16) stop = true;
                cidr += zeros;
            }

            return 128 - cidr;
        };

        IPv6.prototype.range = function () {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        };

        IPv6.prototype.toByteArray = function () {
            return this.parts.flatMap(part => [part >> 8, part & 0xff]);
        };

        IPv6.prototype.toFixedLengthString = function () {
            const addr = this.parts.map(part => padPart(part.toString(16), 4)).join(':');
            return addr + (this.zoneId ? `%${this.zoneId}` : '');
        };

        IPv6.prototype.toIPv4Address = function () {
            if (!this.isIPv4MappedAddress()) {
                throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
            }

            const [high, low] = this.parts.slice(-2);
            return new ipaddr.IPv4([high >> 8, high & 0xff, low >> 8, low & 0xff]);
        };

        IPv6.prototype.toNormalizedString = function () {
            const addr = this.parts.map(part => part.toString(16)).join(':');
            return addr + (this.zoneId ? `%${this.zoneId}` : '');
        };

        IPv6.prototype.toRFC5952String = function () {
            const regex = /((^|:)(0(:|$)){2,})/g;
            const string = this.toNormalizedString();
            let bestMatch = { index: 0, length: -1 };
            let match;

            while ((match = regex.exec(string))) {
                if (match[0].length > bestMatch.length) {
                    bestMatch = { index: match.index, length: match[0].length };
                }
            }

            const { index, length } = bestMatch;
            return length < 0 ? string : `${string.substring(0, index)}::${string.substring(index + length)}`;
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
        if (typeof string === 'string' && !string.includes(':')) return false;

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
        if (addr.parts === null) throw new Error('ipaddr: string is not formatted like an IPv6 Address');
        return new this(addr.parts, addr.zoneId);
    };

    ipaddr.IPv6.parseCIDR = function (string) {
        const match = string.match(/^(.+)\/(\d+)$/);
        const maskLength = parseInt(match[2], 10);

        if (maskLength >= 0 && maskLength <= 128) {
            return [this.parse(match[1]), maskLength];
        }

        throw new Error('ipaddr: string is not formatted like an IPv6 CIDR range');
    };

    ipaddr.IPv6.parser = function (string) {
        let match, zoneId, addr, octets;

        if ((match = string.match(ipv6Regexes.deprecatedTransitional))) {
            return this.parser(`::ffff:${match[1]}`);
        }
        if (ipv6Regexes.native.test(string)) {
            return expandIPv6(string, 8);
        }
        if ((match = string.match(ipv6Regexes.transitional))) {
            zoneId = match[6] || '';
            addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
            if (addr.parts) {
                octets = match.slice(2, 6).map(parseInt);
                if (octets.every(octet => 0 <= octet && octet <= 255)) {
                    addr.parts.push(octets[0] << 8 | octets[1], octets[2] << 8 | octets[3]);
                    return { parts: addr.parts, zoneId: addr.zoneId };
                }
            }
        }
        return null;
    };

    ipaddr.fromByteArray = function (bytes) {
        const length = bytes.length;
        if (length === 4) return new ipaddr.IPv4(bytes);
        if (length === 16) return new ipaddr.IPv6(bytes);
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
        return addr.kind() === 'ipv6' && addr.isIPv4MappedAddress() ? addr.toIPv4Address() : addr;
    };

    ipaddr.subnetMatch = function (address, rangeList, defaultName = 'unicast') {
        for (let rangeName in rangeList) {
            if (Object.prototype.hasOwnProperty.call(rangeList, rangeName)) {
                const rangeSubnets = Array.isArray(rangeList[rangeName][0]) ? rangeList[rangeName] : [rangeList[rangeName]];
                for (let subnet of rangeSubnets) {
                    if (address.kind() === subnet[0].kind() && address.match(...subnet)) {
                        return rangeName;
                    }
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
