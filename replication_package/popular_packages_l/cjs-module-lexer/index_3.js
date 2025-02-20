// cjs-module-lexer.js

class CJSLexer {
  constructor() {
    this.reset();
  }

  reset() {
    this.exports = new Set();
    this.reexports = new Set();
    this.tokens = [];
  }

  parse(code) {
    this.reset();
    this.tokenize(code);
    this.detectExportsAndReexports();
    return {
      exports: Array.from(this.exports),
      reexports: Array.from(this.reexports),
    };
  }

  tokenize(code) {
    const patterns = {
      identifier: /[a-zA-Z_$][0-9a-zA-Z_$]*/,
      stringLiteral: /(["'])(?:(?=(\\?))\2.)*?\1/,
      requireCall: /require\s*\(\s*(['"`])([^'"`]+)\1\s*\)/,
      moduleExports: /module\s*\.\s*exports/,
      dotExports: /exports\s*\.\s*/,
      defineProperty: /Object\s*\.\s*defineProperty/,
    };
    // Suppose 'tokens' are filled here with these patterns as the code is parsed.
  }

  detectExportsAndReexports() {
    let inModuleExports = false;
    let lastRequire = null;

    this.tokens.forEach((token) => {
      if (/module\s*\.\s*exports\s*=/.test(token)) {
        inModuleExports = true;
        if (lastRequire) {
          this.reexports.add(lastRequire);
        }
      } else if (inModuleExports && token.type === 'objectLiteral') {
        this.extractExportsFromObject(token);
        inModuleExports = false;
      } else if (token.type === 'requireCall') {
        lastRequire = token.modulePath;
      } else if (/exports\s*\.\s*/.test(token)) {
        const exportName = this.extractIdentifierAfter(token);
        if (exportName) {
          this.exports.add(exportName);
        }
      } else if (/Object\s*\.\s*defineProperty/.test(token)) {
        const exportName = this.extractKeyFromDefine(token);
        if (exportName) {
          this.exports.add(exportName);
        }
      }
    });
  }

  extractExportsFromObject(token) {
    token.properties.forEach((prop) => {
      if (prop.type === 'property' && prop.key.type === 'identifier') {
        this.exports.add(prop.key.name);
      }
    });
  }

  extractIdentifierAfter(dotExportsToken) {
    // Implement logic to find identifiers following 'exports.'
  }

  extractKeyFromDefine(defineToken) {
    const match = defineToken.match(/,\s*['"`]([^'"`]+)['"`]\s*,/);
    return match ? match[1] : null;
  }
}

function parse(code) {
  const lexer = new CJSLexer();
  return lexer.parse(code);
}

module.exports = {
  parse,
};
