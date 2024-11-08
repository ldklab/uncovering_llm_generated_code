(function (global) {
    'use strict';

    function createIPv4Regexes() {
        const octetPattern = '(0?\\d+|0x[a-f0-9]+)';
        return {
            fourOctet: new RegExp(`^${octetPattern}\\.${octetPattern}\\.${octetPattern}\\.${octetPattern}$`, 'i'),
            threeOctet: new RegExp(`^${octetPattern}\\.${octetPattern}\\.${octetPattern}$`, 'i'),
            twoOctet: new RegExp(`^${octetPattern}\\.${octetPattern}$`, 'i'),
            longValue: new RegExp(`^${octetPattern}$`, 'i')
        };
    }

    function createIPv6Regexes() {
        const part = '(?:[0-9a-f]+::?)+';
        const zoneIndexPattern = '%[0-9a-z]{1,}';
        return {
            zoneIndex: new RegExp(zoneIndexPattern, 'i'),
            native: new RegExp(`^(::)?(${part})?([0-9a-f]+)?(::)?(${zoneIndexPattern})?$`, 'i'),
            deprecatedTransitional: new RegExp(`^(?:::)(${createIPv4Regexes().fourOctet.source}(?:${zoneIndexPattern})?)$`, 'i'),
            transitional: new RegExp(`^((?:${part})|(?:::)(?:${part})?)${createIPv4Regexes().fourOctet.source}(?:${zoneIndexPattern})?$`, 'i')
        };
    }

    function expandIPv6(addr, parts) {
        if (addr.indexOf('::') !== addr.lastIndexOf('::')) return null;

        let colonCount = (addr.match(/:/g) || []).length;
        if (addr.startsWith('::')) colonCount--;
        if (addr.endsWith('::')) colonCount--;

        if (colonCount > parts) return null;

        addr = addr.replace('::', ':' + '0:'.repeat(parts - colonCount));
        addr = addr.startsWith(':') ? addr.slice(1) : addr;
        addr = addr.endsWith(':') ? addr.slice(0, -1) : addr;

        const zoneId = (addr.match(createIPv6Regexes().zoneIndex) || [])[0];
        const partsArray = addr.split(':').map(part => parseInt(part, 16));

        return { parts: partsArray, zoneId: zoneId ? zoneId.slice(1) : null };
    }

    function parseIntAuto(str) {
        if (/^0x/.test(str)) {
            return parseInt(str, 16);
        }
        if (/^0[0-7]+$/.test(str)) {
            return parseInt(str, 8);
        }
        return parseInt(str, 10);
    }

    class IPv4 {
        constructor(octets) {
            if (octets.length !== 4 || octets.some(octet => octet < 0 || octet > 255)) {
                throw new Error('Invalid IPv4 octet count or value');
            }
            this.octets = octets;
        }

        static isValid(string) {
            try {
                new IPv4(IPv4.parser(string));
                return true;
            } catch {
                return false;
            }
        }

        static parser(str) {
            const ipv4Regexes = createIPv4Regexes();
            let match;

            if ((match = str.match(ipv4Regexes.fourOctet))) {
                return match.slice(1).map(parseIntAuto);
            }
            // Additional parsing logic for three, two octet and long value...
            return null;
        }

        toString() {
            return this.octets.join('.');
        }
    }

    class IPv6 {
        constructor(parts, zoneId) {
            if (parts.length !== 8) throw new Error('Invalid IPv6 parts length');
            this.parts = parts;
            this.zoneId = zoneId;
        }

        static isValid(string) {
            try {
                const addr = IPv6.parser(string);
                new IPv6(addr.parts, addr.zoneId);
                return true;
            } catch {
                return false;
            }
        }

        static parser(str) {
            const ipv6Regexes = createIPv6Regexes();
            if (ipv6Regexes.native.test(str)) {
                return expandIPv6(str, 8);
            }
            // Transitional and deprecated-transitional parsing logic...
            return null;
        }

        toString() {
            return this.parts.map(part => part.toString(16)).join(":");
        }
    }

    const ipaddr = {
        IPv4,
        IPv6,
        parse(string) {
            if (IPv6.isValid(string)) return IPv6.parser(string);
            if (IPv4.isValid(string)) return IPv4.parser(string);
            throw new Error('Invalid IP address format');
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ipaddr;
    } else {
        global.ipaddr = ipaddr;
    }

}(this));
