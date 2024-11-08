(function (global) {
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

    function expandIPv6(str, numParts) {
        if (str.indexOf('::') !== str.lastIndexOf('::')) return null;
        let colonCount = (str.match(/:/g) || []).length;
        if (str.substr(0, 2) === '::') colonCount--;
        if (str.substr(-2, 2) === '::') colonCount--;
        if (colonCount > numParts) return null;
        const partsNeeded = numParts - colonCount;
        str = str.replace('::', ':' + Array(partsNeeded + 1).join('0:'));
        if (str[0] === ':') str = str.slice(1);
        if (str[str.length - 1] === ':') str = str.slice(0, -1);

        const parts = str.split(':').map(part => parseInt(part, 16));
        return { parts, zoneId: (str.match(ipv6Regexes.zoneIndex) || [])[0]?.substr(1) };
    }

    function matchCIDR(first, second, partSize, cidrBits) {
        if (first.length !== second.length) throw new Error('ipaddr: lengths differ');
        return first.every((part, i) => (part >> Math.max(0, partSize - cidrBits)) === (second[i] >> Math.max(0, partSize - cidrBits -= partSize)));
    }

    function parseIntAuto(string) {
        if (hexRegex.test(string)) return parseInt(string, 16);
        if (string[0] === '0' && !isNaN(parseInt(string[1], 10))) return octalRegex.test(string) ? parseInt(string, 8) : (() => { throw new Error('ipaddr: cannot parse octal') })();
        return parseInt(string, 10);
    }

    function padPart(part, length) {
        return part.padStart(length, '0');
    }

    const ipaddr = {};

    ipaddr.IPv4 = (function () {
        function IPv4(octets) {
            if (octets.length !== 4 || octets.some(octet => octet < 0 || octet > 255)) throw new Error('ipaddr: incorrect IPv4 octet');
            this.octets = octets;
        }

        IPv4.prototype = {
            constructor: IPv4,
            kind() { return 'ipv4'; },
            match(other, cidrRange) { return matchCIDR(this.octets, other.octets, 8, cidrRange === undefined ? other[1] : cidrRange); },
            toString() { return this.octets.join('.'); },
            toByteArray() { return [...this.octets]; },
            // More method implementations as needed
        };

        IPv4.broadcastAddressFromCIDR = function (string) {
            const [ip, prefix] = this.parseCIDR(string);
            const subnetMask = this.subnetMaskFromPrefixLength(prefix).toByteArray();
            const address = ip.toByteArray().map((octet, i) => octet | (~subnetMask[i] & 255));
            return new this(address);
        };

        IPv4.isValid = function (string) {
            try { return new this(this.parser(string)); } catch (e) { return false; }
        };

        IPv4.parser = function (string) {
            let match;
            if (match = string.match(ipv4Regexes.fourOctet)) return match.slice(1).map(value => parseIntAuto(value));
            if (match = string.match(ipv4Regexes.longValue)) {
                const value = parseIntAuto(match[1]);
                if (value < 0 || value > 0xffffffff) throw new Error('ipaddr: out of range');
                return [(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
            }
            return null;
        };

        IPv4.parseCIDR = function (string) {
            const [ip, prefix] = string.split('/');
            const maskLength = parseInt(prefix, 10);
            if (maskLength < 0 || maskLength > 32) throw new Error('ipaddr: invalid prefix length');
            return [this.parse(ip), maskLength];
        };

        IPv4.subnetMaskFromPrefixLength = function (prefix) {
            const fillOctets = Math.floor(prefix / 8);
            const octets = new Array(4).fill(0).map((_, i) => i < fillOctets ? 255 : Math.pow(2, prefix % 8) - 1 << 8 - (prefix % 8));
            return new this(octets);
        };

        return IPv4;
    })();

    ipaddr.IPv6 = (function () {
        function IPv6(parts, zoneId) {
            if (parts.length !== 8) throw new Error('ipaddr: incorrect IPv6 part count');
            this.parts = parts.map(part => (part < 0 || part > 0xffff) ? (() => { throw new Error('ipaddr: IPv6 part out of range') })() : part);
            this.zoneId = zoneId;
        }

        IPv6.prototype = {
            constructor: IPv6,
            kind() { return 'ipv6'; },
            match(other, cidrRange) { return matchCIDR(this.parts, other.parts, 16, cidrRange === undefined ? other[1] : cidrRange); },
            toString() { return this.parts.map(part => part.toString(16)).join(':'); },
            toByteArray() { return this.parts.flatMap(part => [part >> 8, part & 0xff]); },
            // More method implementations as needed
        }

        IPv6.isValid = function (string) {
            try { return new this(this.parser(string).parts); } catch (e) { return false; }
        }

        IPv6.parser = function (string) {
            const match = ipv6Regexes.deprecatedTransitional.test(string) ? ipv6Regexes.deprecatedTransitional.exec(string) :
                ipv6Regexes.native.test(string) ? ipv6Regexes.native.exec(string) :
                ipv6Regexes.transitional.exec(string);
            
            if (!match) return null;
            const parts = expandIPv6(match[0], 8);
            return parts ? { parts: parts.parts, zoneId: parts.zoneId } : null;
        }

        return IPv6;
    })();

    ipaddr.parse = function (string) {
        if (this.IPv6.isValid(string)) return this.IPv6.parser(string);
        if (this.IPv4.isValid(string)) return this.IPv4.parser(string);
        throw new Error('ipaddr: unrecognized address format');
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ipaddr;
    } else {
        global.ipaddr = ipaddr;
    }

})(this);
