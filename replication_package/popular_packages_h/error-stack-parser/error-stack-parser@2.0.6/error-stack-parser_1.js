(function(global, factory) {
    'use strict';
    // Implements UMD pattern for module definition.

    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous module in AMD.
        define('error-stack-parser', ['stackframe'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Export as a module for Node.js/CommonJS.
        module.exports = factory(require('stackframe'));
    } else {
        // Expose as a browser global when in browsers.
        global.ErrorStackParser = factory(global.StackFrame);
    }
})(this, function(StackFrame) {
    'use strict';

    // Regular expressions to parse stack traces from different browsers.
    const FIREFOX_SAFARI_REGEXP = /(^|@)\S+:\d+/;
    const CHROME_IE_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
    const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
    
    return {
        parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_REGEXP)) {
                return this.parseChromeOrIE(error);
            } else if (error.stack) {
                return this.parseFirefoxOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        extractLocation(urlLike) {
            if (urlLike.indexOf(':') === -1) return [urlLike];

            const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
            const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseChromeOrIE(error) {
            const filtered = error.stack.split('\n').filter(line => {
                return line.match(CHROME_IE_REGEXP);
            }, this);

            return filtered.map(line => {
                if (line.includes('(eval ')) {
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
                }
                const sanitizedLine = line.trim().replace(/\(eval code/g, '(');
                const location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
                sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;

                const tokens = sanitizedLine.split(/\s+/).slice(1);
                const locationParts = this.extractLocation(location ? location[1] : tokens.pop());
                const functionName = tokens.join(' ') || undefined;
                const fileName = ['eval', '<anonymous>'].includes(locationParts[0]) ? undefined : locationParts[0];

                return new StackFrame({
                    functionName,
                    fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFirefoxOrSafari(error) {
            const filtered = error.stack.split('\n').filter(line => {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return filtered.map(line => {
                if (line.includes(' > eval')) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
                }

                if (!line.includes('@') && !line.includes(':')) {
                    return new StackFrame({ functionName: line });
                } else {
                    const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                    const matches = line.match(functionNameRegex);
                    const functionName = matches ? matches[1] : undefined;
                    const locationParts = this.extractLocation(line.replace(functionNameRegex, ''));

                    return new StackFrame({
                        functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                        source: line
                    });
                }
            }, this);
        },
        
        parseOpera(error) {
            if (!error.stacktrace || (error.message.indexOf('\n') > -1 &&
                error.message.split('\n').length > error.stacktrace.split('\n').length)) {
                return this.parseOpera9(error);
            } else if (!error.stack) {
                return this.parseOpera10(error);
            } else {
                return this.parseOpera11(error);
            }
        },

        parseOpera9(error) {
            const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            const lines = error.message.split('\n');
            const result = [];

            for (let i = 2; i < lines.length; i += 2) {
                const match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: match[1],
                        source: lines[i]
                    }));
                }
            }
            return result;
        },

        parseOpera10(error) {
            const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            const lines = error.stacktrace.split('\n');
            const result = [];

            lines.forEach(line => {
                const match = lineRE.exec(line);
                if (match) {
                    result.push(new StackFrame({
                        functionName: match[3] || undefined,
                        fileName: match[2],
                        lineNumber: match[1],
                        source: line
                    }));
                }
            });
            return result;
        },

        parseOpera11(error) {
            const filtered = error.stack.split('\n').filter(line => {
                return line.match(FIREFOX_SAFARI_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return filtered.map(line => {
                const tokens = line.split('@');
                const locationParts = this.extractLocation(tokens.pop());
                const functionCall = tokens.shift() || '';
                const functionName = functionCall
                    .replace(/<anonymous function(: (\w+))?>/, '$2')
                    .replace(/\([^)]*\)/g, '') || undefined;
                let argsRaw;

                if (functionCall.match(/\(([^)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, '$1');
                }

                const args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');

                return new StackFrame({
                    functionName,
                    args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        }
    };
});
