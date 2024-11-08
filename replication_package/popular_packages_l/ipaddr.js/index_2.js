// ipaddr.js
class IPv4 {
  constructor(octets) {
    if (octets.length !== 4) throw new Error('Invalid IPv4 address');
    this.octets = octets;
  }

  kind() { return 'ipv4'; }

  toString() { return this.octets.join('.'); }

  toByteArray() { return [...this.octets]; }

  static isValid(str) { return /^(\d{1,3}\.){3}\d{1,3}$/.test(str); }

  static parse(str) {
    if (!this.isValid(str)) throw new Error('Invalid IPv4 address');
    return new IPv4(str.split('.').map(Number));
  }

  static subnetMaskFromPrefixLength(prefixLength) {
    if (prefixLength < 0 || prefixLength > 32) return null;
    const mask = (0xFFFFFFFF << (32 - prefixLength)) >>> 0;
    return new IPv4([
      (mask >>> 24) & 0xFF,
      (mask >>> 16) & 0xFF,
      (mask >>> 8) & 0xFF,
      mask & 0xFF
    ]).toString();
  }

  static broadcastAddressFromCIDR(cidr) {
    const [ipStr, prefixLength] = cidr.split('/');
    const ip = this.parse(ipStr);
    const networkAddress = ip.toByteArray().map((b, i) => b & ((0xFF << (8 - (i * 8) >= prefixLength ? 0 : 8)) & 0xFF));
    const broadcastAddress = networkAddress.map((b, i) => b | ((0xFF >>> (i * 8 >= prefixLength ? 8 : 0))));
    return new IPv4(broadcastAddress).toString();
  }

  static networkAddressFromCIDR(cidr) {
    const [ipStr, prefixLength] = cidr.split('/');
    const ip = this.parse(ipStr);
    const mask = (0xFFFFFFFF << (32 - +prefixLength)) >>> 0;
    const networkAddress = ip.toByteArray().map((b, i) => b & ((mask >>> ((3 - i) * 8)) & 0xFF));
    return new IPv4(networkAddress).toString();
  }
}

class IPv6 {
  constructor(parts, zoneId = '') {
    if (parts.length !== 8) throw new Error('Invalid IPv6 address');
    this.parts = parts;
    this.zoneId = zoneId;
  }

  kind() { return 'ipv6'; }

  toString() {
    const partsStr = this.parts.map(part => part.toString(16)).join(':');
    return partsStr.replace(/(:|^)(0+(:|$)){2,}/, '::') + (this.zoneId ? `%${this.zoneId}` : '');
  }

  toNormalizedString() { return this.parts.map(part => part.toString(16).padStart(4, '0')).join(':'); }

  toByteArray() {
    const bytes = [];
    this.parts.forEach(part => {
      bytes.push((part >> 8) & 0xFF, part & 0xFF);
    });
    return bytes;
  }

  static isValid(str) {
    return /^(([0-9a-fA-F]{1,4}(::?|(?<!^):(?!.)):){0,6}(?:(?(1)|::)?[0-9a-fA-F]{1,4}))$/.test(str);
  }

  static parse(str) {
    if (!this.isValid(str)) throw new Error('Invalid IPv6 address');
    const zoneId = str.includes('%') ? str.split('%')[1] : '';
    const parts = str.split(/::?|:/).map(part => parseInt(part.padStart(4, '0'), 16));
    if (str.includes('::')) parts.splice(parts.indexOf(0), 0, ...Array(8 - parts.length).fill(0));
    return new IPv6(parts, zoneId);
  }
}

const ipaddr = {
  isValid(str) { return IPv4.isValid(str) || IPv6.isValid(str); },

  isValidCIDR(cidr) {
    const [ipStr, prefixLength] = cidr.split('/');
    return this.isValid(ipStr) && /^\d+$/.test(prefixLength) && +prefixLength >= 0;
  },

  parse(str) {
    if (IPv4.isValid(str)) return IPv4.parse(str);
    if (IPv6.isValid(str)) return IPv6.parse(str);
    throw new Error('Invalid IP address');
  },

  process(str) {
    const addr = this.parse(str);
    if (addr.kind() === 'ipv6' && addr.parts.slice(0, 6).every(part => part === 0) && addr.parts[6] === 0xFFFF) {
      return new IPv4(addr.parts.slice(6).map(part => part >>> 8));
    }
    return addr;
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = ipaddr;
