import { Parser } from 'acorn';

class JavaScriptParser {
    constructor() {
        this.version = '1.0.0';
        this.supportedEcmaVersions = [3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        this.latestEcmaVersion = '16';
    }

    parse(code, options = {}) {
        const configuration = {
            ...options,
            ecmaVersion: options.ecmaVersion ?? 5,
            sourceType: options.sourceType ?? 'script',
            ranges: options.ranges ?? false,
            locations: options.locations ?? false,
            onComment: options.comment ? [] : undefined,
            onToken: options.tokens ? [] : undefined,
        };
        return Parser.parse(code, configuration);
    }

    tokenize(code, options = {}) {
        const configuration = {
            ...options,
            ecmaVersion: options.ecmaVersion ?? 5,
            onToken: options.tokens ? [] : undefined,
        };
        return Parser.tokenize(code, configuration).tokens;
    }

    getVisitorKeys() {
        // Functionality for providing visitor keys.
        return {}; // Mimics eslint visitor keys.
    }
}

export const espreeInstance = new JavaScriptParser();
espreeInstance.parse = espreeInstance.parse.bind(espreeInstance);
espreeInstance.tokenize = espreeInstance.tokenize.bind(espreeInstance);

export default espreeInstance;
