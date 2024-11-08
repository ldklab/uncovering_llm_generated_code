import { Parser as AcornParser } from 'acorn';

class EspreeParser {
    constructor() {
        this.version = '1.0.0';
        this.supportedEcmaVersions = [3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        this.latestEcmaVersion = '16';
    }

    parse(code, options = {}) {
        const finalOptions = {
            ...options,
            ecmaVersion: options.ecmaVersion || 5,
            sourceType: options.sourceType || 'script',
            ranges: options.range || false,
            locations: options.loc || false,
            onComment: options.comment ? [] : undefined,
            onToken: options.tokens ? [] : undefined,
        };
        return AcornParser.parse(code, finalOptions);
    }

    tokenize(code, options = {}) {
        const finalOptions = {
            ...options,
            ecmaVersion: options.ecmaVersion || 5,
            onToken: options.tokens ? [] : undefined,
        };
        return AcornParser.tokenize(code, finalOptions).tokens;
    }

    VisitorKeys() {
        // Placeholder for VisitorKeys functionality.
        return {}; // eslint-compatible visitor keys.
    }
}

// Exporting the parser class and version for external access.
export const espree = new EspreeParser();
espree.parse = espree.parse.bind(espree);
espree.tokenize = espree.tokenize.bind(espree);

export default espree;
