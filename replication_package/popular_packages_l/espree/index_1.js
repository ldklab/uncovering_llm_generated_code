import { Parser as AcornParser } from 'acorn';

class EspreeParser {
    constructor() {
        this.version = '1.0.0';
        this.supportedEcmaVersions = Array.from({ length: 14 }, (_, i) => i + 3); // ECMAScript versions 3 to 16
        this.latestEcmaVersion = '16';
    }

    parse(code, options = {}) {
        const finalOptions = {
            ecmaVersion: options.ecmaVersion || 5,
            sourceType: options.sourceType || 'script',
            ranges: options.range || false,
            locations: options.loc || false,
            onComment: options.comment ? [] : undefined,
            onToken: options.tokens ? [] : undefined,
            ...options,
        };
        return AcornParser.parse(code, finalOptions);
    }

    tokenize(code, options = {}) {
        const finalOptions = {
            ecmaVersion: options.ecmaVersion || 5,
            onToken: options.tokens ? [] : undefined,
            ...options,
        };
        return AcornParser.tokenize(code, finalOptions).tokens;
    }

    VisitorKeys() {
        return {}; // ESLint-compatible visitor keys placeholder.
    }
}

export const espree = new EspreeParser();
espree.parse = espree.parse.bind(espree);
espree.tokenize = espree.tokenize.bind(espree);

export default espree;
