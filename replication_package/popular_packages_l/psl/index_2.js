// psl.js
const publicSuffixList = require('publicsuffixlist'); // Imaginary module for example purposes

const psl = {
  parse(domain) {
    if (typeof domain !== 'string') return null;

    domain = domain.toLowerCase().trim();
    const parts = domain.split('.');

    if (parts.length < 2) return null;

    let tldIndex = -1;
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts.slice(i).join('.');
      if (publicSuffixList.includes(candidate)) {
        tldIndex = i;
        break;
      }
    }

    if (tldIndex === -1) return null;

    const tld = parts.slice(tldIndex).join('.');
    const sld = parts[tldIndex - 1] || null;
    const domainName = sld ? `${sld}.${tld}` : null;
    const subdomain = parts.slice(0, tldIndex - 1).join('.') || null;

    return { tld, sld, domain: domainName, subdomain };
  },

  get(domain) {
    const parsed = this.parse(domain);
    return parsed ? parsed.domain : null;
  },

  isValid(domain) {
    return this.get(domain) !== null;
  }
};

module.exports = psl;

// Example Usage
const parsedDomain = psl.parse('www.google.com');
console.log(parsedDomain);

console.log(psl.get('example.COM')); // 'example.com'
console.log(psl.isValid('google.com')); // true
