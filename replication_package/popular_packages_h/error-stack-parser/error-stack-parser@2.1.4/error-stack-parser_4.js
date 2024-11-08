(function(root, factory) {
    'use strict';
    // UMD pattern for module definition
    
    if (typeof define === 'function' && define.amd) {
        // Support AMD
        define('error-stack-parser', ['stackframe'], factory);
    } else if (typeof exports === 'object') {
        // Support CommonJS/Node.js
        module.exports = factory(require('stackframe'));
    } else {
        // Browser global
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
    const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
    const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

    function extractLocation(urlLike) {
        if (urlLike.indexOf(':') === -1) {
            return [urlLike];
        }
        const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
        const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
        return [parts[1], parts[2] || undefined, parts[3] || undefined];
    }

    function parseV8OrIE(error) {
        const filtered = error.stack.split('\n').filter(line => line.match(CHROME_IE_STACK_REGEXP));
        return filtered.map(line => {
            if (line.includes('(eval ')) {
                line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*\)|,.*$)/g, '');
            }
            let sanitizedLine = line.replace(/^\s+/, '').replace(/^\S+\s+/, '');
            const location = sanitizedLine.match(/ (\(.+\)$)/);
            if (location) sanitizedLine = sanitizedLine.replace(location[0], '');
            const locationParts = extractLocation(location ? location[1] : sanitizedLine);
            const functionName = location && sanitizedLine || undefined;
            const fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];
            return new StackFrame({
                functionName: functionName,
                fileName: fileName,
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
                source: line
            });
        });
    }

    function parseFFOrSafari(error) {
        const filtered = error.stack.split('\n').filter(line => !line.match(SAFARI_NATIVE_CODE_REGEXP));
        return filtered.map(line => {
            if (line.includes(' > eval')) {
                line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
            }
            const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
            const matches = line.match(functionNameRegex);
            const functionName = matches && matches[1] || undefined;
            const locationParts = extractLocation(line.replace(functionNameRegex, ''));
            return new StackFrame({
                functionName: functionName,
                fileName: locationParts[0],
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
                source: line
            });
        });
    }

    function parseOpera(error) {
        if (!error.stacktrace || (error.message.indexOf('\n') > -1 && error.message.split('\n').length > error.stacktrace.split('\n').length)) {
            return parseOpera9(error);
        } else if (!error.stack) {
            return parseOpera10(error);
        } else {
            return parseOpera11(error);
        }
    }

    function parseOpera9(error) {
        const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        const lines = error.message.split('\n');
        let result = [];
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
    }

    function parseOpera10(error) {
        const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        const lines = error.stacktrace.split('\n');
        let result = [];
        for (let i = 0; i < lines.length; i += 2) {
            const match = lineRE.exec(lines[i]);
            if (match) {
                result.push(new StackFrame({
                    functionName: match[3] || undefined,
                    fileName: match[2],
                    lineNumber: match[1],
                    source: lines[i]
                }));
            }
        }
        return result;
    }

    function parseOpera11(error) {
        const filtered = error.stack.split('\n').filter(line => line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/));
        return filtered.map(line => {
            const tokens = line.split('@');
            const locationParts = extractLocation(tokens.pop());
            const functionCall = (tokens.shift() || '');
            const functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, '$2').replace(/\([^)]*\)/g, '') || undefined;
            const argsRaw = (functionCall.match(/\(([^)]*)\)/) || [])[1];
            const args = (!argsRaw || argsRaw === '[arguments not available]') ? undefined : argsRaw.split(',');
            return new StackFrame({
                functionName: functionName,
                args: args,
                fileName: locationParts[0],
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
                source: line
            });
        });
    }

    return {
        parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return parseV8OrIE(error);
            } else if (error.stack) {
                return parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },
        extractLocation,
        parseV8OrIE,
        parseFFOrSafari,
        parseOpera,
        parseOpera9,
        parseOpera10,
        parseOpera11
    };

}));
