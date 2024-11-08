const punycode = require('punycode/');

class TR46 {
  static toASCII(domainName, options = {}) {
    this.validateOptions(options);
    let asciiDomain = domainName.split('.').map(label => {
      let validatedLabel = this.processLabel(label, options);
      return punycode.toASCII(validatedLabel);
    }).join('.');
    
    if (options.verifyDNSLength && asciiDomain.length > 253) {
      throw new Error("DNS name exceeds maximum length");
    }
    return asciiDomain;
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
        return label; // Return label as is if ignoring invalid
      }
    }).join('.');
  }

  static processLabel(label, options) {
    if (options.checkHyphens && (label.startsWith('-') || label.endsWith('-'))) {
      throw new Error("Invalid hyphen positions");
    }
    if (options.checkJoiners && this.detectJoinerIssues(label)) {
      throw new Error("Invalid joiner characters");
    }

    if (options.transitionalProcessing) {
      return label.replace(/[\u00DF\u03C2\u200D]/g, '');
    }
    return label;
  }

  static detectJoinerIssues(label) {
    return label.includes('\u200D');
  }

  static validateOptions(options) {
    const allowedKeys = [
      'checkBidi', 'checkHyphens', 'checkJoiners', 'ignoreInvalidPunycode', 
      'transitionalProcessing', 'useSTD3ASCIIRules', 'verifyDNSLength'
    ];
    Object.keys(options).forEach(key => {
      if (!allowedKeys.includes(key)) {
        throw new Error(`Invalid option: ${key}`);
      }
    });
  }
}

module.exports = TR46;
