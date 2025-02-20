(function (root) {
    'use strict';
    
    const ipv4Part = '(0?\\d+|0x[a-f0-9]+)';
    const ipv4Regexes = {
        fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, 'i'),
        longValue: new RegExp(`^${ipv4Part}$`, 'i')
    };

    const octalRegex = /^0[0-7]+$/i;
    const hexRegex = /^0x[a-f0-9]+$/i;
    const zoneIndex = '%[0-9a-z]{1,}';
    
    const ipv6Part = '(?:[0-9a-f]+::?)+';
    const ipv6Regexes = {
        zoneIndex: new RegExp(zoneIndex, 'i'),
        native: new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`, 'i'),
        deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`, 'i'),
        transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`, 'i')
    };
    
    function expandIPv6(string, parts) {
        if (string.indexOf('::') !== string.lastIndexOf('::')) return null;
        
        let colonCount = (string.match(/:/g) || []).length;
        let zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0];
        
        if (zoneId) {
            zoneId = zoneId.substring(1);
            string = string.replace(/%.+$/, '');
        }

        if (/^::/.test(string)) colonCount--;
        if (/::$/.test(string)) colonCount--;
        if (colonCount > parts) return null;

        let replacement = ':';
        replacement += '0:'.repeat(parts - colonCount);

        string = string.replace('::', replacement);
        if (string.startsWith(':')) string = string.slice(1);
        if (string.endsWith(':')) string = string.slice(0, -1);

        const results = string.split(':').map(part => parseInt(part, 16));
        
        return { parts: results, zoneId };
    }
    
    function matchCIDR(first, second, partSize, cidrBits) {
        if (first.length !== second.length) throw new Error('ipaddr: cannot match CIDR for objects with different lengths');

        let part = 0;
        while (cidrBits > 0) {
            let shift = Math.max(0, partSize - cidrBits);
            if (first[part] >> shift !== second[part] >> shift) return false;
            cidrBits -= partSize;
            part++;
        }

        return true;
    }
    
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

    function padPart(part, length) {
        return part.padStart(length, '0');
    }

    const ipaddr = {};

    ipaddr.IPv4 = (function () {
        function IPv4(octets) {
            if (octets.length !== 4) throw new Error('ipaddr: ipv4 octet count should be 4');
            this.octets = octets.map(octet => {
                if (!(0 <= octet && octet <= 255)) throw new Error('ipaddr: ipv4 octet should fit in 8 bits');
                return octet;
            });
        }

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
                [new IPv4([198, 18, 0, 0]), 15],
                [new IPv4([198, 51, 100, 0]), 24],
                [new IPv4([203, 0, 113, 0]), 24],
                [new IPv4([240, 0, 0, 0]), 4]
            ],
        };

        IPv4.prototype.kind = function () {
            return 'ipv4';
        };

        IPv4.prototype.match = function (other, cidrRange) {
            if (typeof cidrRange === 'undefined') [other, cidrRange] = other;
            if (other.kind() !== 'ipv4') throw new Error('ipaddr: cannot match ipv4 address with non-ipv4 one');
            return matchCIDR(this.octets, other.octets, 8, cidrRange);
        };

        IPv4.prototype.prefixLengthFromSubnetMask = function () {
            const zerotable = {0: 8, 128: 7, 192: 6, 224: 5, 240: 4, 248: 3, 252: 2, 254: 1, 255: 0};
            let cidr = 0, stop = false;
            for (let i = 3; i >= 0; i--) {
                const octet = this.octets[i];
                if (octet in zerotable) {
                    const zeros = zerotable[octet];
                    if (stop && zeros) return null;
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
            return [...this.octets];
        };

        IPv4.prototype.toIPv4MappedAddress = function () {
            return ipaddr.IPv6.parse(`::ffff:${this.toString()}`);
        };

        IPv4.prototype.toNormalizedString = IPv4.prototype.toString = function () {
            return this.octets.join('.');
        };

        return IPv4;
    })();

    ipaddr.IPv4.broadcastAddressFromCIDR = function (string) {
        const cidr = this.parseCIDR(string);
        const ipInterfaceOctets = cidr[0].toByteArray();
        const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
        return new this(ipInterfaceOctets.map((octet, i) => octet | (subnetMaskOctets[i] ^ 255)));
    };

    ipaddr.IPv4.isIPv4 = function (string) {
        return this.parser(string) !== null;
    };

    ipaddr.IPv4.isValid = function (string) {
        try {
            new this(this.parser(string));
            return true;
        } catch (e) {
            return false;
        }
    };

    ipaddr.IPv4.isValidCIDR = function (string) {
        try {
            this.parseCIDR(string);
            return true;
        } catch (e) {
            return false;
        }
    };

    ipaddr.IPv4.isValidFourPartDecimal = function (string) {
        return ipaddr.IPv4.isValid(string) && /^[0-9]+(\.[0-9]+){3}$/.test(string);
    };

    ipaddr.IPv4.networkAddressFromCIDR = function (string) {
        const cidr = this.parseCIDR(string);
        const ipInterfaceOctets = cidr[0].toByteArray();
        const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
        return new this(ipInterfaceOctets.map((octet, i) => octet & subnetMaskOctets[i]));
    };

    ipaddr.IPv4.parse = function (string) {
        const parts = this.parser(string);
        if (parts === null) throw new Error('ipaddr: string is not formatted like an IPv4 Address');
        return new this(parts);
    };

    ipaddr.IPv4.parseCIDR = function (string) {
        const match = string.match(/^(.+)\/(\d+)$/);
        if (!match || match[2] < 0 || match[2] > 32) throw new Error('ipaddr: string is not formatted like an IPv4 CIDR range');
        return [this.parse(match[1]), parseInt(match[2])];
    };

    ipaddr.IPv4.parser = function (string) {
        let match = string.match(ipv4Regexes.fourOctet) || string.match(ipv4Regexes.longValue) || string.match(ipv4Regexes.twoOctet) || string.match(ipv4Regexes.threeOctet);
        if (!match) return null;
        const ref = match.slice(1);
        
        if (match = match[0].match(ipv4Regexes.longValue)) {
            const value = parseIntAuto(match[1]);
            if (value > 0xffffffff || value < 0) throw new Error('ipaddr: address outside defined range');
            return [24, 16, 8, 0].map(shift => (value >> shift) & 0xff).reverse();
        }
        
        return ref.flatMap(part => {
            const value = parseIntAuto(part);
            return ref.length === 3 ? [0, value >> 16, value >> 8, value & 0xff] : [value];
        });
    };

    ipaddr.IPv4.subnetMaskFromPrefixLength = function (prefix) {
        prefix = parseInt(prefix);
        if (prefix < 0 || prefix > 32) throw new Error('ipaddr: invalid IPv4 prefix length');

        const octets = Array(4).fill(0).map((_, i) => i < prefix / 8 ? 255 : 0);
        if (prefix % 8 !== 0) octets[Math.floor(prefix / 8)] = (0xff << (8 - (prefix % 8))) & 0xff;
        return new this(octets);
    };

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
            if (zoneId) this.zoneId = zoneId;

            this.parts.forEach(part => {
                if (!(0 <= part && part <= 0xffff)) throw new Error('ipaddr: ipv6 part should fit in 16 bits');
            });
        }

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
        };

        IPv6.prototype.isIPv4MappedAddress = function () {
            return this.range() === 'ipv4Mapped';
        };

        IPv6.prototype.kind = function () {
            return 'ipv6';
        };

        IPv6.prototype.match = function (other, cidrRange) {
            if (typeof cidrRange === 'undefined') [other, cidrRange] = other;
            if (other.kind() !== 'ipv6') throw new Error('ipaddr: cannot match ipv6 address with non-ipv6 one');
            return matchCIDR(this.parts, other.parts, 16, cidrRange);
        };

        IPv6.prototype.prefixLengthFromSubnetMask = function () {
            const zerotable = {0: 16, 32768: 15, 49152: 14, 57344: 13, 61440: 12, 63488: 11, 64512: 10, 65024: 9, 65280: 8, 65408: 7, 65472: 6, 65504: 5, 65520: 4, 65528: 3, 65532: 2, 65534: 1, 65535: 0};
            let cidr = 0, stop = false;
            for (let part of this.parts.reverse()) {
                if (part in zerotable) {
                    const zeros = zerotable[part];
                    if (stop && zeros) return null;
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
            return this.parts.flatMap(part => [part >> 8, part & 0xff]);
        };

        IPv6.prototype.toFixedLengthString = function () {
            let string = this.parts.map(part => padPart(part.toString(16), 4)).join(':');
            return this.zoneId ? `${string}%${this.zoneId}` : string;
        };

        IPv6.prototype.toIPv4Address = function () {
            if (!this.isIPv4MappedAddress()) throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
            const bytes = this.parts.slice(-2);
            return new ipaddr.IPv4([bytes[0] >> 8, bytes[0] & 0xff, bytes[1] >> 8, bytes[1] & 0xff]);
        };

        IPv6.prototype.toRFC5952String = function () {
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
        };

        IPv6.prototype.toNormalizedString = IPv6.prototype.toString = function () {
            const parts = this.parts.map(part => part.toString(16)).join(':');
            return this.zoneId ? `${parts}%${this.zoneId}` : parts;
        };

        return IPv6;
    })();

    ipaddr.IPv6.broadcastAddressFromCIDR = function (string) {
        const cidr = this.parseCIDR(string);
        const ipInterfaceOctets = cidr[0].toByteArray();
        const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
        return new this(ipInterfaceOctets.map((octet, i) => octet | (subnetMaskOctets[i] ^ 255)));
    };

    ipaddr.IPv6.isIPv6 = function (string) {
        return this.parser(string) !== null;
    };

    ipaddr.IPv6.isValid = function (string) {
        if (typeof string !== 'string' || string.indexOf(':') === -1) return false;
        try {
            const addr = this.parser(string);
            new this(addr.parts, addr.zoneId);
            return true;
        } catch (e) {
            return false;
        }
    };

    ipaddr.IPv6.isValidCIDR = function (string) {
        if (typeof string !== 'string' || string.indexOf(':') === -1) return false;
        try {
            this.parseCIDR(string);
            return true;
        } catch (e) {
            return false;
        }
    };

    ipaddr.IPv6.networkAddressFromCIDR = function (string) {
        const cidr = this.parseCIDR(string);
        const ipInterfaceOctets = cidr[0].toByteArray();
        const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
        return new this(ipInterfaceOctets.map((octet, i) => octet & subnetMaskOctets[i]));
    };

    ipaddr.IPv6.parse = function (string) {
        const addr = this.parser(string);
        if (addr.parts === null) throw new Error('ipaddr: string is not formatted like an IPv6 Address');
        return new this(addr.parts, addr.zoneId);
    };

    ipaddr.IPv6.parseCIDR = function (string) {
        const match = string.match(/^(.+)\/(\d+)$/);
        if (!match || match[2] < 0 || match[2] > 128) throw new Error('ipaddr: string is not formatted like an IPv6 CIDR range');
        return [this.parse(match[1]), parseInt(match[2])];
    };

    ipaddr.IPv6.parser = function (string) {
        let match;
        if ((match = string.match(ipv6Regexes.deprecatedTransitional))) {
            return this.parser(`::ffff:${match[1]}`);
        }

        if (ipv6Regexes.native.test(string)) return expandIPv6(string, 8);

        if ((match = string.match(ipv6Regexes.transitional))) {
            let parts = expandIPv6(match[1].endsWith('::') ? match[1] : match[1].slice(0, -1), 6).parts;
            if (parts) {
                const octets = [parseInt(match[2]), parseInt(match[3]), parseInt(match[4]), parseInt(match[5])];
                if (octets.every(octet => 0 <= octet && octet <= 255)) {
                    parts.push((octets[0] << 8) | octets[1]);
                    parts.push((octets[2] << 8) | octets[3]);
                    return { parts, zoneId: match[6] || '' };
                }
            }
        }

        return null;
    };

    ipaddr.IPv6.subnetMaskFromPrefixLength = function (prefix) {
        prefix = parseInt(prefix);
        if (prefix < 0 || prefix > 128) throw new Error('ipaddr: invalid IPv6 prefix length');

        const octets = Array(16).fill(0).map((_, i) => i < prefix / 8 ? 255 : 0);
        if (prefix % 8 !== 0) octets[Math.floor(prefix / 8)] = (0xff << (8 - (prefix % 8))) & 0xff;
        return new this(octets);
    };

    ipaddr.fromByteArray = function (bytes) {
        switch (bytes.length) {
            case 4:
                return new ipaddr.IPv4(bytes);
            case 16:
                return new ipaddr.IPv6(bytes);
            default:
                throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
        }
    };

    ipaddr.isValid = function (string) {
        return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
    };

    ipaddr.isValidCIDR = function (string) {
        return ipaddr.IPv6.isValidCIDR(string) || ipaddr.IPv4.isValidCIDR(string);
    };

    ipaddr.parse = function (string) {
        if (ipaddr.IPv6.isValid(string)) return ipaddr.IPv6.parse(string);
        if (ipaddr.IPv4.isValid(string)) return ipaddr.IPv4.parse(string);
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
        for (const [rangeName, subnets] of Object.entries(rangeList)) {
            for (const subnet of (Array.isArray(subnets[0]) ? subnets : [subnets])) {
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
