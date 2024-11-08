import { Parser as AcornParser } from 'acorn';

class EspreeParser {
  constructor() {
    this.version = '1.0.0';
    this.supportedEcmaVersions = Array.from({ length: 14 }, (_, i) => i + 3);
    this.latestEcmaVersion = String(Math.max(...this.supportedEcmaVersions));
  }

  parse(code, options = {}) {
    const defaultOptions = {
      ecmaVersion: 5,
      sourceType: 'script',
      ranges: false,
      locations: false,
      onComment: undefined,
      onToken: undefined,
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      ecmaVersion: options.ecmaVersion ?? defaultOptions.ecmaVersion,
      sourceType: options.sourceType ?? defaultOptions.sourceType,
      ranges: options.range ?? defaultOptions.ranges,
      locations: options.loc ?? defaultOptions.locations,
      onComment: options.comment ? [] : defaultOptions.onComment,
      onToken: options.tokens ? [] : defaultOptions.onToken,
    };

    return AcornParser.parse(code, finalOptions);
  }

  tokenize(code, options = {}) {
    const defaultOptions = {
      ecmaVersion: 5,
      onToken: undefined,
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      ecmaVersion: options.ecmaVersion ?? defaultOptions.ecmaVersion,
      onToken: options.tokens ? [] : defaultOptions.onToken,
    };

    return AcornParser.tokenize(code, finalOptions).tokens;
  }

  VisitorKeys() {
    return {};
  }
}

export const espree = new EspreeParser();
espree.parse = espree.parse.bind(espree);
espree.tokenize = espree.tokenize.bind(espree);

export default espree;
