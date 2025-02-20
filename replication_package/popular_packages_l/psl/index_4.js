// psl.js
const publicSuffixList = require('publicsuffixlist'); // Imaginary module for example purposes

/**
 * This code defines an object `psl` to handle domain name parsing. 
 * It uses an imaginary `publicSuffixList` module that contains a list of valid TLDs.
 * The `psl` object has three main methods:
 * - `parse(domain)`: Parses the input domain into its TLD (top-level domain), SLD (second-level domain), and subdomain.
 * - `get(domain)`: Returns the full domain (e.g., "example.com") if the input domain is valid; otherwise, returns null.
 * - `isValid(domain)`: Returns a boolean indicating whether the input domain is valid.
 */

const psl = {
  /**
   * Parses a given domain string into its components: TLD, SLD, domain name, and subdomain.
   * @param {string} domain - The domain to parse.
   * @returns {Object|null} - The parsed components or null if invalid.
   */
  parse(domain) {
    if (typeof domain !== 'string') return null;

    // Normalize the domain by converting to lowercase and trimming whitespace.
    domain = domain.toLowerCase().trim();
    const parts = domain.split('.');

    // Ensure the domain has at least two parts (SLD + TLD).
    if (parts.length < 2) return null;

    let tldIndex = -1;
    // Determine the TLD by searching the public suffix list from the domain's end.
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts.slice(i).join('.');
      if (publicSuffixList.includes(candidate)) {
        tldIndex = i;
        break;
      }
    }

    // Return null if no TLD is found.
    if (tldIndex === -1) return null;

    // Extract the TLD, SLD, and subdomain components.
    const tld = parts.slice(tldIndex).join('.');
    const sld = parts[tldIndex - 1] || null;
    const domainName = sld ? `${sld}.${tld}` : null;
    const subdomain = parts.slice(0, tldIndex - 1).join('.') || null;

    return { tld, sld, domain: domainName, subdomain };
  },

  /**
   * Retrieves the full domain name if the given domain is valid.
   * @param {string} domain - The domain from which to extract the full domain name.
   * @returns {string|null} - The full domain name or null if invalid.
   */
  get(domain) {
    const parsed = this.parse(domain);
    return parsed ? parsed.domain : null;
  },

  /**
   * Checks whether a provided domain is valid.
   * @param {string} domain - The domain to validate.
   * @returns {boolean} - True if the domain is valid; false otherwise.
   */
  isValid(domain) {
    return this.get(domain) !== null;
  }
};

// Export the psl module
module.exports = psl;

// Example usage of the psl module
const parsedDomain = psl.parse('www.google.com');
console.log(parsedDomain); // Expected Output: { tld: 'com', sld: 'google', domain: 'google.com', subdomain: 'www' }

console.log(psl.get('example.COM')); // Expected Output: 'example.com'
console.log(psl.isValid('google.com')); // Expected Output: true
