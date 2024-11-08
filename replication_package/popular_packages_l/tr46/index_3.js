const punycode = require('punycode/');

class TR46 {
  static toASCII(domainName, options = {}) {
    this.validateOptions(options);
    let result = domainName.split('.').map(label => {
      const processedLabel = this.preprocessLabel(label, options);
      return punycode.toASCII(processedLabel);
    }).join('.');
    
    if (options.verifyDNSLength && result.length > 253) {
      throw new Error("DNS name exceeds maximum length");
    }
    return result;
  }

  static toUnicode(domainName, options = {}) {
    this.validateOptions(options);
    let result = domainName.split('.').map(label => {
      try {
        return punycode.toUnicode(label);
      } catch {
        if (!options.ignoreInvalidPunycode) {
          throw new Error("Invalid Punycode detected");
        }
        return label;
      }
    }).join('.');
    return result;
  }

  static preprocessLabel(label, options) {
    if (options.checkHyphens && /^-|-$/.test(label)) {
      throw new Error("Invalid hyphen positions");
    }
    if (options.checkJoiners && this.containsInvalidJoiner(label)) {
      throw new Error("Invalid joiner characters");
    }

    if (options.transitionalProcessing) {
      return label.replace(/[\u00DF\u03C2\u200D]/g, ''); // Remove specific characters
    }
    return label;
  }

  static containsInvalidJoiner(label) {
    return /\u200D/.test(label);
  }

  static validateOptions(options) {
    const validOptions = [
      'checkBidi', 'checkHyphens', 'checkJoiners', 
      'ignoreInvalidPunycode', 'transitionalProcessing', 
      'useSTD3ASCIIRules', 'verifyDNSLength'
    ];
    for (const key of Object.keys(options)) {
      if (!validOptions.includes(key)) {
        throw new Error(`Invalid option: ${key}`);
      }
    }
  }
}

module.exports = TR46;
