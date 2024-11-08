// psl.js
const publicSuffixList = require('publicsuffixlist'); // Imaginary module

const psl = {

  // Parse the domain to extract TLD, SLD, and subdomain
  parse(domain) {
    if (typeof domain !== 'string') return null;

    // Normalize domain input
    domain = domain.toLowerCase().trim();
    const parts = domain.split('.');

    // Ensure domain has at least a TLD and one additional part
    if (parts.length < 2) return null;

    let tldIndex = -1;

    // Find TLD by checking against known public suffixes
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts.slice(i).join('.');
      if (publicSuffixList.includes(candidate)) {
        tldIndex = i;
        break;
      }
    }

    // If no valid TLD is found, return null
    if (tldIndex === -1) return null;

    // Extract TLD, SLD, domain and subdomain
    const tld = parts.slice(tldIndex).join('.');
    const sld = parts[tldIndex - 1] || null;
    const domainName = sld ? `${sld}.${tld}` : null;
    const subdomain = parts.slice(0, tldIndex - 1).join('.') || null;

    return { tld, sld, domain: domainName, subdomain };
  },

  // Get the main domain name without subdomain
  get(domain) {
    const parsed = this.parse(domain);
    return parsed ? parsed.domain : null;
  },

  // Validate if the domain has a correct TLD and structure
  isValid(domain) {
    return this.get(domain) !== null;
  }
};

// Export the PSL module
module.exports = psl;

// Example Usage
const parsedDomain = psl.parse('www.google.com');
console.log(parsedDomain); // Output: { tld: 'com', sld: 'google', domain: 'google.com', subdomain: 'www' }

console.log(psl.get('example.COM')); // Returns: 'example.com'
console.log(psl.isValid('google.com')); // Returns: true
