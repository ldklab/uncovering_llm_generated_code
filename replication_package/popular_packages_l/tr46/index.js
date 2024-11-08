const punycode = require('punycode/');

class TR46 {
  static toASCII(domainName, options = {}) {
    this.checkOptions(options);
    let result = '';
    const labels = domainName.split('.');
    for (const label of labels) {
      const processedLabel = this.processLabel(label, options);
      const asciiLabel = punycode.toASCII(processedLabel);
      result += asciiLabel + '.';
    }
    result = result.slice(0, -1); // Remove trailing dot
    if (options.verifyDNSLength && result.length > 253) {
      throw new Error("DNS name exceeds maximum length");
    }
    return result;
  }

  static toUnicode(domainName, options = {}) {
    this.checkOptions(options);
    let result = '';
    const labels = domainName.split('.');
    for (const label of labels) {
      try {
        const unicodeLabel = punycode.toUnicode(label);
        result += unicodeLabel + '.';
      } catch {
        if (!options.ignoreInvalidPunycode) {
          throw new Error("Invalid Punycode detected");
        }
      }
    }
    return result.slice(0, -1); // Remove trailing dot
  }

  static processLabel(label, options) {
    if (options.checkHyphens && (label.startsWith('-') || label.endsWith('-'))) {
      throw new Error("Invalid hyphen positions");
    }
    if (options.checkJoiners && this.hasJoinerIssues(label)) {
      throw new Error("Invalid joiner characters");
    }

    if (options.transitionalProcessing) {
      // Simulate transitional processing; actual implementation would follow TR46 specs
      return label.replace(/[\u00DF\u03C2\u200D]/g, ''); // Example: remove ß, ς, ZWJ
    }
    return label;
  }

  static hasJoinerIssues(label) {
    // Check for illegal joiner sequences (simple placeholder example)
    return label.includes('\u200D'); // ZWJ might not be in the start/end
  }

  static checkOptions(options) {
    const validKeys = [
      'checkBidi', 'checkHyphens', 'checkJoiners', 'ignoreInvalidPunycode', 
      'transitionalProcessing', 'useSTD3ASCIIRules', 'verifyDNSLength'
    ];
    for (const key of Object.keys(options)) {
      if (!validKeys.includes(key)) {
        throw new Error(`Invalid option: ${key}`);
      }
    }
  }
}

module.exports = TR46;
