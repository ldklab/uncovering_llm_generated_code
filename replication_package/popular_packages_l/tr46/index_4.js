const punycode = require('punycode/');

class TR46 {
  static toASCII(domainName, options = {}) {
    this.validateOptions(options);
    const labels = domainName.split('.');
    const result = labels.map(label => {
      const processedLabel = this.processLabel(label, options);
      return punycode.toASCII(processedLabel);
    }).join('.');
    if (options.verifyDNSLength && result.length > 253) {
      throw new Error("DNS name exceeds maximum length");
    }
    return result;
  }

  static toUnicode(domainName, options = {}) {
    this.validateOptions(options);
    return domainName.split('.').map(label => {
      try {
        return punycode.toUnicode(label);
      } catch {
        if (!options.ignoreInvalidPunycode) {
          throw new Error("Invalid Punycode detected");
        }
      }
    }).filter(Boolean).join('.');
  }

  static processLabel(label, options) {
    if (options.checkHyphens && (label.startsWith('-') || label.endsWith('-'))) {
      throw new Error("Invalid hyphen positions");
    }
    if (options.checkJoiners && this.containsIllegalJoiners(label)) {
      throw new Error("Invalid joiner characters");
    }

    if (options.transitionalProcessing) {
      return label.replace(/[\u00DF\u03C2\u200D]/g, ''); // Example processing
    }
    return label;
  }

  static containsIllegalJoiners(label) {
    return label.includes('\u200D'); // Placeholder for ZWJ check
  }

  static validateOptions(options) {
    const validOptions = [
      'checkBidi', 'checkHyphens', 'checkJoiners', 'ignoreInvalidPunycode', 
      'transitionalProcessing', 'useSTD3ASCIIRules', 'verifyDNSLength'
    ];
    for (const key of Object.keys(options)) {
      if (!validOptions.includes(key)) {
        throw new Error(`Invalid option: ${key}`);
      }
    }
  }
}

module.exports = TR46;
