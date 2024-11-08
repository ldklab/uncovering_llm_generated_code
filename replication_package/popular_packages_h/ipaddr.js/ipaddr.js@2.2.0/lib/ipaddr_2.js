(function (root) {
    'use strict';

    const ipv4Part = '(0?\\d+|0x[a-f0-9]+)';
    const ipv4Regexes = {
        fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, 'i'),
        longValue: new RegExp(`^${ipv4Part}$`, 'i')
    };

    const octalRegex = new RegExp(`^0[0-7]+$`, 'i');
    const hexRegex = new RegExp(`^0x[a-f0-9]+$`, 'i');

    const zoneIndexPattern = '%[0-9a-z]{1,}';
    const ipv6Part = '(?:[0-9a-f]+::?)+';
    const ipv6Regexes = {
        zoneIndex: new RegExp(zoneIndexPattern, 'i'),
        'native': new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndexPattern})?$`, 'i'),
        deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndexPattern})?)$`, 'i'),
        transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndexPattern})?$`, 'i')
    };

    function expandIPv6(address, parts) {
        if (address.indexOf('::') !== address.lastIndexOf('::')) {
            return null;
        }

        let zoneIdMatch = address.match(ipv6Regexes.zoneIndex);
        let zoneId = zoneIdMatch ? zoneIdMatch[0].substring(1) : undefined;
        address = zoneId ? address.replace(/%.+$/, '') : address;

        let colonCount = (address.match(/:/g) || []).length;
        colonCount = colonCount - (address.startsWith('::') || address.endsWith('::') ? 1 : 0);

        if (colonCount > parts) {
            return null;
        }

        let replacement = ':'.repeat(parts - colonCount).split('').map(() => '0').join(':');
        address = address.replace('::', replacement);

        if (address.startsWith(':')) {
            address = address.slice(1);
        }
        if (address.endsWith(':')) {
            address = address.slice(0, -1);
        }

        let results = address.split(':').map(part => parseInt(part, 16));
        return { parts: results, zoneId: zoneId };
    }

    function matchCIDR(first, second, partSize, cidrBits) {
        if (first.length !== second.length) {
            throw new Error('ipaddr: cannot match CIDR for objects with different lengths');
        }

        let part = 0;
        while (cidrBits > 0) {
            let shift = Math.max(partSize - cidrBits, 0);
            if ((first[part] >> shift) !== (second[part] >> shift)) {
                return false;
            }
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

    function IPv4(octets) {
        if (octets.length !== 4) {
            throw new Error('ipaddr: ipv4 octet count should be 4');
        }
        if (!octets.every(octet => 0 <= octet && octet <= 255)) {
            throw new Error('ipaddr: ipv4 octet should fit in 8 bits');
        }
        this.octets = octets;
    }

    IPv4.prototype.SpecialRanges = {
        unspecified: [[new IPv4([0, 0, 0, 0]), 8]],
        broadcast: [[new IPv4([255, 255, 255, 255]), 32]],
        multicast: [[new IPv4([224, 0, 0, 0]), 4]],
        linkLocal: [[new IPv4([169, 254, 0, 0]), 16]],
        loopback: [[new IPv4([127, 0, 0, 0]), 8]],
        carrierGradeNat: [[new IPv4([100, 64, 0, 0]), 10]],
        'private': [
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
            [new IPv4([192, 31, 196, 0]), 24],
        ],
        amt: [[new IPv4([192, 52, 193, 0]), 24]],
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
        let cidr = 0, stop = false;
        const zerotable = {
            0: 8, 128: 7, 192: 6, 224: 5, 240: 4, 248: 3, 252: 2, 254: 1, 255: 0
        };
        for (let i = 3; i >= 0; i--) {
            const octet = this.octets[i];
            if (!(octet in zerotable)) {
                return null;
            }
            const zeros = zerotable[octet];
            if (stop && zeros !== 0) {
                return null;
            }
            if (zeros !== 8) {
                stop = true;
            }
            cidr += zeros;
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

    ipaddr.IPv4 = IPv4;

    ipaddr.IPv4.broadcastAddressFromCIDR = function (string) {
        const cidr = this.parseCIDR(string);
        const ipInterfaceOctets = cidr[0].toByteArray();
        const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
        const octets = [];
        for (let i = 0; i < 4; i++) {
            octets.push((ipInterfaceOctets[i] | ~subnetMaskOctets[i]) & 255);
        }
        return new this(octets);
    };

    ipaddr.IPv4.isIPv4 = function (string) {
        return this.parser(string) !== null;
    };

    ipaddr.IPv4.isValid = function (string) {
        try {
            new this(this.parser(string));
            return true;
        } catch {
            return false;
        }
    };

    ipaddr.IPv4.isValidCIDR = function (string) {
        try {
            this.parseCIDR(string);
            return true;
        } catch {
            return false;
        }
    };

    ipaddr.IPv4.isValidFourPartDecimal = function (string) {
        return ipaddr.IPv4.isValid(string) && string.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/);
    };

    ipaddr.IPv4.networkAddressFromCIDR = function (string) {
        try {
            const cidr = this.parseCIDR(string);
            const ipInterfaceOctets = cidr[0].toByteArray();
            const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
            const octets = [];
            for (let i = 0; i < 4; i++) {
                octets.push(ipInterfaceOctets[i] & subnetMaskOctets[i]);
            }
            return new this(octets);
        } catch {
            throw new Error('ipaddr: the address does not have IPv4 CIDR format');
        }
    };

    ipaddr.IPv4.parse = function (string) {
        const parts = this.parser(string);
        if (parts === null) {
            throw new Error('ipaddr: string is not formatted like an IPv4 Address');
        }
        return new this(parts);
    };

    ipaddr.IPv4.parseCIDR = function (string) {
        const match = string.match(/^(.+)\/(\d+)$/);
        if (match) {
            const maskLength = parseInt(match[2]);
            if (maskLength >= 0 && maskLength <= 32) {
                const parsed = [this.parse(match[1]), maskLength];
                Object.defineProperty(parsed, 'toString', { value: () => parsed.join('/') });
                return parsed;
            }
        }
        throw new Error('ipaddr: string is not formatted like an IPv4 CIDR range');
    };

    ipaddr.IPv4.parser = function (string) {
        let match, part, value;
        if ((match = string.match(ipv4Regexes.fourOctet))) {
            return match.slice(1, 6).map(parseIntAuto);
        } else if ((match = string.match(ipv4Regexes.longValue))) {
            value = parseIntAuto(match[1]);
            if (value < 0 || value > 0xffffffff) {
                throw new Error('ipaddr: address outside defined range');
            }
            return [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
        } else if ((match = string.match(ipv4Regexes.twoOctet))) {
            value = parseIntAuto(match[2]);
            if (value < 0 || value > 0xffffff) {
                throw new Error('ipaddr: address outside defined range');
            }
            return [parseIntAuto(match[1]), (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
        } else if ((match = string.match(ipv4Regexes.threeOctet))) {
            value = parseIntAuto(match[3]);
            if (value < 0 || value > 0xffff) {
                throw new Error('ipaddr: address outside defined range');
            }
            return [parseIntAuto(match[1]), parseIntAuto(match[2]), (value >>> 8) & 255, value & 255];
        }
        return null;
    };

    ipaddr.IPv4.subnetMaskFromPrefixLength = function (prefix) {
        prefix = parseInt(prefix);
        if (prefix < 0 || prefix > 32) {
            throw new Error('ipaddr: invalid IPv4 prefix length');
        }

        const octets = [];
        let filledOctetCount = Math.floor(prefix / 8);
        octets.fill(255, 0, filledOctetCount);
        if (filledOctetCount < 4) {
            octets[filledOctetCount] = 255 - ((1 << (8 - (prefix % 8))) - 1);
        }
        return new this(octets);
    };

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
        reserved: [
            [new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 23],
            [new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32],
        ],
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
        let cidr = 0, stop = false;
        const zerotable = {
            0: 16, 32768: 15, 49152: 14, 57344: 13, 61440: 12, 63488: 11, 64512: 10, 65024: 9,
            65280: 8, 65408: 7, 65472: 6, 65504: 5, 65520: 4, 65528: 3, 65532: 2, 65534: 1, 65535: 0
        };
        for (let i = 7; i >= 0; i--) {
            const part = this.parts[i];
            if (!(part in zerotable)) {
                return null;
            }
            const zeros = zerotable[part];
            if (stop && zeros !== 0) {
                return null;
            }
            if (zeros !== 16) {
                stop = true;
            }
            cidr += zeros;
        }
        return 128 - cidr;
    };

    IPv6.prototype.range = function () {
        return ipaddr.subnetMatch(this, this.SpecialRanges);
    };

    IPv6.prototype.toByteArray = function () {
        return this.parts.flatMap(part => [(part >> 8) & 255, part & 255]);
    };

    IPv6.prototype.toFixedLengthString = function () {
        let addrStr = this.parts.map(part => padPart(part.toString(16), 4)).join(':');
        if (this.zoneId) {
            addrStr += `%${this.zoneId}`;
        }
        return addrStr;
    };

    IPv6.prototype.toIPv4Address = function () {
        if (!this.isIPv4MappedAddress()) {
            throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
        }
        const [high, low] = this.parts.slice(-2);
        return new ipaddr.IPv4([high >> 8, high & 255, low >> 8, low & 255]);
    };

    IPv6.prototype.toNormalizedString = function () {
        let addrStr = this.parts.map(part => part.toString(16)).join(':');
        if (this.zoneId) {
            addrStr += `%${this.zoneId}`;
        }
        return addrStr;
    };

    IPv6.prototype.toRFC5952String = function () {
        let string = this.toNormalizedString();
        const match = string.match(/((^|:)(0(:|$)){2,})/g) || [];
        let bestMatch, bestLength = -1;
        match.forEach(m => {
            if (m.length > bestLength) {
                bestMatch = m;
                bestLength = m.length;
            }
        });
        if (bestMatch && bestLength >= 0) {
            const startIndex = string.indexOf(bestMatch);
            string = `${string.substring(0, startIndex)}::${string.substring(startIndex + bestLength)}`;
        }
        return string;
    };

    IPv6.prototype.toString = function () {
        return this.toRFC5952String();
    };

    ipaddr.IPv6 = IPv6;

    ipaddr.IPv6.broadcastAddressFromCIDR = function (string) {
        const cidr = this.parseCIDR(string);
        const ipInterfaceOctets = cidr[0].toByteArray();
        const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
        const octets = [];
        for (let i = 0; i < 16; i++) {
            octets.push((ipInterfaceOctets[i] | ~subnetMaskOctets[i]) & 255);
        }
        return new this(octets);
    };

    ipaddr.IPv6.isIPv6 = function (string) {
        return this.parser(string) !== null;
    };

    ipaddr.IPv6.isValid = function (string) {
        if (typeof string === 'string' && !string.includes(':')) {
            return false;
        }
        try {
            const parsedAddr = this.parser(string);
            new this(parsedAddr.parts, parsedAddr.zoneId);
            return true;
        } catch {
            return false;
        }
    };

    ipaddr.IPv6.isValidCIDR = function (string) {
        if (typeof string === 'string' && !string.includes(':')) {
            return false;
        }
        try {
            this.parseCIDR(string);
            return true;
        } catch {
            return false;
        }
    };

    ipaddr.IPv6.networkAddressFromCIDR = function (string) {
        try {
            const cidr = this.parseCIDR(string);
            const ipInterfaceOctets = cidr[0].toByteArray();
            const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
            const octets = [];
            for (let i = 0; i < 16; i++) {
                octets.push(ipInterfaceOctets[i] & subnetMaskOctets[i]);
            }
            return new this(octets);
        } catch {
            throw new Error(`ipaddr: the address does not have IPv6 CIDR format`);
        }
    };

    ipaddr.IPv6.parse = function (string) {
        const addr = this.parser(string);
        if (!addr.parts) {
            throw new Error('ipaddr: string is not formatted like an IPv6 Address');
        }
        return new this(addr.parts, addr.zoneId);
    };

    ipaddr.IPv6.parseCIDR = function (string) {
        const match = string.match(/^(.+)\/(\d+)$/);
        if (match) {
            const maskLength = parseInt(match[2]);
            if (maskLength >= 0 && maskLength <= 128) {
                const parsed = [this.parse(match[1]), maskLength];
                Object.defineProperty(parsed, 'toString', { value: () => parsed.join('/') });
                return parsed;
            }
        }
        throw new Error('ipaddr: string is not formatted like an IPv6 CIDR range');
    };

    ipaddr.IPv6.parser = function (string) {
        const deprecatedMatch = string.match(ipv6Regexes.deprecatedTransitional);
        if (deprecatedMatch) {
            return this.parser(`::ffff:${deprecatedMatch[1]}`);
        }
        if (ipv6Regexes.native.test(string)) {
            return expandIPv6(string, 8);
        }
        const match = string.match(ipv6Regexes.transitional);
        if (match) {
            let addr = match[1];
            if (!addr.endsWith('::')) addr = addr.slice(0, -1);
            const expanded = expandIPv6(addr + match[6], 6);
            if (expanded.parts) {
                const octets = [match[2], match[3], match[4], match[5]].map(n => parseInt(n, 10));
                if (octets.every(octet => 0 <= octet && octet <= 255)) {
                    expanded.parts.push((octets[0] << 8) | octets[1]);
                    expanded.parts.push((octets[2] << 8) | octets[3]);
                    return expanded;
                }
            }
        }
        return null;
    };

    ipaddr.IPv6.subnetMaskFromPrefixLength = function (prefix) {
        prefix = parseInt(prefix);
        if (prefix < 0 || prefix > 128) {
            throw new Error('ipaddr: invalid IPv6 prefix length');
        }
        const octets = new Array(16).fill(0);
        let filledOctetCount = Math.floor(prefix / 8);
        octets.fill(255, 0, filledOctetCount);
        if (filledOctetCount < 16) {
            octets[filledOctetCount] = 255 - ((1 << (8 - (prefix % 8))) - 1);
        }
        return new this(octets);
    };

    ipaddr.fromByteArray = function (bytes) {
        if (bytes.length === 4) {
            return new ipaddr.IPv4(bytes);
        } else if (bytes.length === 16) {
            return new ipaddr.IPv6(bytes);
        } else {
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
        if (ipaddr.IPv6.isValid(string)) {
            return ipaddr.IPv6.parse(string);
        } else if (ipaddr.IPv4.isValid(string)) {
            return ipaddr.IPv4.parse(string);
        } else {
            throw new Error('ipaddr: the address has neither IPv6 nor IPv4 format');
        }
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
        return (addr.kind() === 'ipv6' && addr.isIPv4MappedAddress()) ? addr.toIPv4Address() : addr;
    };

    ipaddr.subnetMatch = function (address, rangeList, defaultName = 'unicast') {
        for (let rangeName in rangeList) {
            if (Object.prototype.hasOwnProperty.call(rangeList, rangeName)) {
                let rangeSubnets = rangeList[rangeName];
                if (!Array.isArray(rangeSubnets[0])) {
                    rangeSubnets = [rangeSubnets];
                }
                for (let i = 0; i < rangeSubnets.length; i++) {
                    const subnet = rangeSubnets[i];
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
