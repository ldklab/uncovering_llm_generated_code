// psl.js
const publicSuffixList = require('publicsuffixlist'); // Imaginary module for example purposes

const psl = {
  parse(domain) {
    if (typeof domain !== 'string') return null;

    domain = domain.toLowerCase().trim();
    const parts = domain.split('.');

    if (parts.length < 2) return null; // TLD + at least one more part

    let tldIndex = -1;
    // Find the TLD by checking the PSL (Here simply checking from the end of the list)
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts.slice(i).join('.');
      if (publicSuffixList.includes(candidate)) {
        tldIndex = i;
        break;
      }
    }

    if (tldIndex === -1) return null; // No valid TLD found

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

// Export module
module.exports = psl;

// Example Usage
const parsedDomain = psl.parse('www.google.com');
console.log(parsedDomain);
// Output:
// {
//   tld: 'com',
//   sld: 'google',
//   domain: 'google.com',
//   subdomain: 'www'
// }

console.log(psl.get('example.COM')); // 'example.com'
console.log(psl.isValid('google.com')); // true

