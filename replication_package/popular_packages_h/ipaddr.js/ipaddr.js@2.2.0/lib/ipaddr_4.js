(function (root) {
    'use strict';
    
    const ipv4Part = '(0?\\d+|0x[a-f0-9]+)';
    const ipv4Regexes = createIPv4Regexes(ipv4Part);
    const octalRegex = /^0[0-7]+$/i;
    const hexRegex = /^0x[a-f0-9]+$/i;
    const zoneIndex = '%[0-9a-z]{1,}';
    const ipv6Part = '(?:[0-9a-f]+::?)+';
    const ipv6Regexes = createIPv6Regexes(ipv6Part, zoneIndex);
    const ipaddr = {};

    function createIPv4Regexes(ipv4Part) {
        return {
            fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
            threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
            twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, 'i'),
            longValue: new RegExp(`^${ipv4Part}$`, 'i')
        };
    }

    function createIPv6Regexes(ipv6Part, zoneIndex) {
        return {
            zoneIndex: new RegExp(zoneIndex, 'i'),
            native: new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`, 'i'),
            deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`, 'i'),
            transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`, 'i')
        };
    }

    function expandIPv6(address, parts) {
        if (address.indexOf('::') !== address.lastIndexOf('::')) return null;

        const zoneId = (address.match(ipv6Regexes.zoneIndex) || [])[0];
        if (zoneId) address = address.replace(/%.+$/, '');

        const colonCount = (address.match(/:/g) || []).length - (address.slice(-1) === ':');

        if (colonCount > parts) return null;

        const replacement = `:${'0:'.repeat(parts - colonCount)}`;
        address = address.replace('::', replacement).replace(/^:|:$/, '');

        const segments = address.split(':').map(segment => parseInt(segment, 16));
        return { parts: segments, zoneId: zoneId ? zoneId.slice(1) : undefined };
    }

    function matchCIDR(first, second, partSize, cidrBits) {
        if (first.length !== second.length) throw new Error('ipaddr: cannot match CIDR for objects with different lengths');

        while (cidrBits > 0) {
            const shift = Math.max(partSize - cidrBits, 0);
            if (first[partSize - 1] >> shift !== second[partSize - 1] >> shift) return false;

            cidrBits -= partSize;
            partSize -= 1;
        }

        return true;
    }

    function parseIntAuto(string) {
        if (hexRegex.test(string)) return parseInt(string, 16);
        if (octalRegex.test(string)) return parseInt(string, 8);
        return parseInt(string, 10);
    }

    function padPart(part, length) {
        return part.padStart(length, '0');
    }

    function IPv4(octets) {
        if (octets.length !== 4) throw new Error('ipaddr: ipv4 octet count should be 4');
        this.octets = octets.map(checkIPv4Octet);
    }

    function checkIPv4Octet(octet) {
        if (0 <= octet && octet <= 255) return octet;
        throw new Error('ipaddr: ipv4 octet should fit in 8 bits');
    }

    function IPv6(parts, zoneId) {
        if (parts.length !== 8 && parts.length !== 16) throw new Error('ipaddr: ipv6 part count should be 8 or 16');

        this.parts = parts.length === 16 ? getIPv6PartsFromArray(parts) : parts;
        this.parts.forEach(checkIPv6Part);

        if (zoneId) this.zoneId = zoneId;
    }

    function getIPv6PartsFromArray(parts) {
        return parts.reduce((acc, _, i) => (i % 2 ? acc : [...acc, (parts[i] << 8) | parts[i + 1]]), []);
    }

    function checkIPv6Part(part) {
        if (0 <= part && part <= 0xffff) return part;
        throw new Error('ipaddr: ipv6 part should fit in 16 bits');
    }

    Object.assign(IPv4.prototype, {
        kind: () => 'ipv4',
        match: function (other, cidrRange) {
            if (typeof cidrRange === 'undefined') [other, cidrRange] = other;
            if (other.kind() !== 'ipv4') throw new Error('ipaddr: cannot match ipv4 address with non-ipv4 one');
            return matchCIDR(this.octets, other.octets, 8, cidrRange);
        },
        range: function () { return ipaddr.subnetMatch(this, this.SpecialRanges); },
        toByteArray: function () { return this.octets.slice(0); },
        toIPv4MappedAddress: function () { return ipaddr.IPv6.parse(`::ffff:${this.toString()}`); },
        toNormalizedString: function () { return this.toString(); },
        toString: function () { return this.octets.join('.'); },
        prefixLengthFromSubnetMask: function () {
            let cidr = 0, stop = false;
            const zerotable = { 0: 8, 128: 7, 192: 6, 224: 5, 240: 4, 248: 3, 252: 2, 254: 1, 255: 0 };

            for (let i = 3; i >= 0; i--) {
                const octet = this.octets[i];
                const zeros = zerotable[octet] ?? null;
                if (zeros === null || (stop && zeros !== 0)) return null;
                if (zeros !== 8) stop = true;
                cidr += zeros;
            }

            return 32 - cidr;
        }
    });

    IPv4.prototype.SpecialRanges = {
        unspecified: [new IPv4([0, 0, 0, 0]), 8],
        broadcast: [new IPv4([255, 255, 255, 255]), 32],
        multicast: [new IPv4([224, 0, 0, 0]), 4],
        linkLocal: [new IPv4([169, 254, 0, 0]), 16],
        loopback: [new IPv4([127, 0, 0, 0]), 8],
        carrierGradeNat: [new IPv4([100, 64, 0, 0]), 10],
        private: [
            [new IPv4([10, 0, 0, 0]), 8],
            [new IPv4([172, 16, 0, 0]), 12],
            [new IPv4([192, 168, 0, 0]), 16]
        ],
        reserved: [
            [new IPv4([192, 0, 0, 0]), 24],
            [new IPv4([192, 0, 2, 0]), 24],
            [new IPv4([192, 88, 99, 0]), 24],
            [new IPv4([198, 18, 0, 0]), 15],
            [new IPv4([198, 51, 100, 0]), 24],
            [new IPv4([203, 0, 113, 0]), 24],
            [new IPv4([240, 0, 0, 0]), 4]
        ],
        as112: [
            [new IPv4([192, 175, 48, 0]), 24],
            [new IPv4([192, 31, 196, 0]), 24]
        ],
        amt: [new IPv4([192, 52, 193, 0]), 24]
    };

    Object.assign(IPv6.prototype, {
        kind: () => 'ipv6',
        isIPv4MappedAddress: function () { return this.range() === 'ipv4Mapped'; },
        match: function (other, cidrRange) {
            if (typeof cidrRange === 'undefined') [other, cidrRange] = other;
            if (other.kind() !== 'ipv6') throw new Error(`ipaddr: cannot match ipv6 address with non-ipv6 one`);
            return matchCIDR(this.parts, other.parts, 16, cidrRange);
        },
        range: function () { return ipaddr.subnetMatch(this, this.SpecialRanges); },
        toByteArray: function () { return this.parts.flatMap(part => [part >> 8, part & 0xff]); },
        toFixedLengthString: function () {
            return this.parts.map(part => padPart(part.toString(16), 4)).join(':') + (this.zoneId ? `%${this.zoneId}` : '');
        },
        toIPv4Address: function () {
            if (!this.isIPv4MappedAddress()) throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
            const [high, low] = this.parts.slice(-2);
            return new ipaddr.IPv4([high >> 8, high & 0xff, low >> 8, low & 0xff]);
        },
        toNormalizedString: function () { return this.parts.map(part => part.toString(16)).join(':') + (this.zoneId ? `%${this.zoneId}` : ''); },
        toRFC5952String: function () {
            const regex = /((^|:)(0(:|$)){2,})/g;
            const string = this.toNormalizedString();
            let match, bestMatchIndex = 0, bestMatchLength = -1;

            while ((match = regex.exec(string))) {
                if (match[0].length > bestMatchLength) {
                    bestMatchIndex = match.index;
                    bestMatchLength = match[0].length;
                }
            }

            return bestMatchLength < 0 ? string : `${string.slice(0, bestMatchIndex)}::${string.slice(bestMatchIndex + bestMatchLength)}`;
        },
        toString: function () { return this.toRFC5952String(); }
    });

    IPv6.prototype.SpecialRanges = {
        unspecified: [new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128],
        linkLocal: [new IPv6([0xfe80, 0, 0, 0, 0, 0, 0, 0]), 10],
        multicast: [new IPv6([0xff00, 0, 0, 0, 0, 0, 0, 0]), 8],
        loopback: [new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128],
        uniqueLocal: [new IPv6([0xfc00, 0, 0, 0, 0, 0, 0, 0]), 7],
        ipv4Mapped: [new IPv6([0, 0, 0, 0, 0, 0xffff, 0, 0]), 96],
        discard: [new IPv6([0x100, 0, 0, 0, 0, 0, 0, 0]), 64],
        rfc6145: [new IPv6([0, 0, 0, 0, 0xffff, 0, 0, 0]), 96],
        rfc6052: [new IPv6([0x64, 0xff9b, 0, 0, 0, 0, 0, 0]), 96],
        '6to4': [new IPv6([0x2002, 0, 0, 0, 0, 0, 0, 0]), 16],
        teredo: [new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 32],
        benchmarking: [new IPv6([0x2001, 0x2, 0, 0, 0, 0, 0, 0]), 48],
        amt: [new IPv6([0x2001, 0x3, 0, 0, 0, 0, 0, 0]), 32],
        as112v6: [
            [new IPv6([0x2001, 0x4, 0x112, 0, 0, 0, 0, 0]), 48],
            [new IPv6([0x2620, 0x4f, 0x8000, 0, 0, 0, 0, 0]), 48],
        ],
        deprecated: [new IPv6([0x2001, 0x10, 0, 0, 0, 0, 0, 0]), 28],
        orchid2: [new IPv6([0x2001, 0x20, 0, 0, 0, 0, 0, 0]), 28],
        droneRemoteIdProtocolEntityTags: [new IPv6([0x2001, 0x30, 0, 0, 0, 0, 0, 0]), 28],
        reserved: [
            [new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 23],
            [new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32],
        ]
    };

    ipaddr.IPv4 = IPv4;
    ipaddr.IPv6 = IPv6;

    ipaddr.fromByteArray = function (bytes) {
        if (bytes.length === 4) return new ipaddr.IPv4(bytes);
        if (bytes.length === 16) return new ipaddr.IPv6(bytes);
        throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
    };

    ipaddr.isValid = function (string) {
        return ipaddr.IPv4.isValid(string) || ipaddr.IPv6.isValid(string);
    };

    ipaddr.isValidCIDR = function (string) {
        return ipaddr.IPv4.isValidCIDR(string) || ipaddr.IPv6.isValidCIDR(string);
    };

    ipaddr.parse = function (string) {
        if (ipaddr.IPv4.isValid(string)) return ipaddr.IPv4.parse(string);
        if (ipaddr.IPv6.isValid(string)) return ipaddr.IPv6.parse(string);
        throw new Error('ipaddr: the address has neither IPv6 nor IPv4 format');
    };

    ipaddr.parseCIDR = function (string) {
        try {
            return ipaddr.IPv4.parseCIDR(string);
        } catch (e) {
            try {
                return ipaddr.IPv6.parseCIDR(string);
            } catch (e2) {
                throw new Error('ipaddr: the address has neither IPv6 nor IPv4 CIDR format');
            }
        }
    };

    ipaddr.process = function (string) {
        const addr = this.parse(string);
        return addr.kind() === 'ipv6' && addr.isIPv4MappedAddress() ? addr.toIPv4Address() : addr;
    };

    ipaddr.subnetMatch = function (address, rangeList, defaultName = 'unicast') {
        for (const rangeName in rangeList) {
            const rangeSubnets = Array.isArray(rangeList[rangeName][0]) ? rangeList[rangeName] : [rangeList[rangeName]];

            for (const subnet of rangeSubnets) {
                if (address.kind() === subnet[0].kind() && address.match(...subnet)) {
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
