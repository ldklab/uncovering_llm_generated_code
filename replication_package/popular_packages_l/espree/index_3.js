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
        return {}; // Placeholder for eslint-compatible visitor keys.
    }
}

const espreeInstance = new EspreeParser();
espreeInstance.parse = espreeInstance.parse.bind(espreeInstance);
espreeInstance.tokenize = espreeInstance.tokenize.bind(espreeInstance);

export const espree = espreeInstance;
export default espreeInstance;
