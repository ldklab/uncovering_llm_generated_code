const punycode = require('punycode/');

class TR46 {
  static convertToASCII(domainName, options = {}) {
    this.validateOptions(options);
    let asciiDomain = '';
    const labels = domainName.split('.');
    for (const label of labels) {
      const validLabel = this.handleLabel(label, options);
      const asciiLabel = punycode.toASCII(validLabel);
      asciiDomain += asciiLabel + '.';
    }
    asciiDomain = asciiDomain.slice(0, -1); // Trim the trailing dot
    if (options.verifyDNSLength && asciiDomain.length > 253) {
      throw new Error("DNS name exceeds maximum length");
    }
    return asciiDomain;
  }

  static convertToUnicode(domainName, options = {}) {
    this.validateOptions(options);
    let unicodeDomain = '';
    const labels = domainName.split('.');
    for (const label of labels) {
      try {
        const unicodeLabel = punycode.toUnicode(label);
        unicodeDomain += unicodeLabel + '.';
      } catch {
        if (!options.ignoreInvalidPunycode) {
          throw new Error("Invalid Punycode detected");
        }
      }
    }
    return unicodeDomain.slice(0, -1); // Trim the trailing dot
  }

  static handleLabel(label, options) {
    if (options.checkHyphens && (label.startsWith('-') || label.endsWith('-'))) {
      throw new Error("Invalid hyphen positions");
    }
    if (options.checkJoiners && this.detectJoinerIssues(label)) {
      throw new Error("Invalid joiner characters");
    }

    if (options.transitionalProcessing) {
      // Example of transitional processing
      return label.replace(/[\u00DF\u03C2\u200D]/g, ''); // Remove ß, ς, and ZWJ
    }
    return label;
  }

  static detectJoinerIssues(label) {
    // Detect improper ZWJ sequences
    return label.includes('\u200D'); // Placeholder check for ZWJ
  }

  static validateOptions(options) {
    const expectedKeys = [
      'checkBidi', 'checkHyphens', 'checkJoiners', 'ignoreInvalidPunycode', 
      'transitionalProcessing', 'useSTD3ASCIIRules', 'verifyDNSLength'
    ];
    for (const key of Object.keys(options)) {
      if (!expectedKeys.includes(key)) {
        throw new Error(`Invalid option: ${key}`);
      }
    }
  }
}

module.exports = TR46;
