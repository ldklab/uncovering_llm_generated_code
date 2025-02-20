(function(root, factory) {
    'use strict';

    // UMD Pattern for module compatibility
    if (typeof define === 'function' && define.amd) {
        define('error-stack-parser', ['stackframe'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('stackframe'));
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
    const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
    const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

    function extractLocation(urlLike) {
        if (!urlLike.includes(':')) {
            return [urlLike];
        }
        const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
        const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
        return [parts[1], parts[2], parts[3]];
    }

    function sanitizeV8Line(line) {
        line = line.includes('(eval ') ? line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(\),.*$)/g, '') : line;
        return line.replace(/^\s+/, '').replace(/\(eval code/g, '(');
    }

    function parseV8OrIE(error) {
        return error.stack.split('\n').filter(line => CHROME_IE_STACK_REGEXP.test(line)).map(line => {
            const sanitizedLine = sanitizeV8Line(line);
            const locationMatch = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
            const cleanedLine = locationMatch ? sanitizedLine.replace(locationMatch[0], '') : sanitizedLine;
            const tokens = cleanedLine.split(/\s+/).slice(1);
            const locationParts = extractLocation(locationMatch ? locationMatch[1] : tokens.pop());
            const functionName = tokens.join(' ') || undefined;
            const fileName = ['eval', '<anonymous>'].includes(locationParts[0]) ? undefined : locationParts[0];

            return new StackFrame({
                functionName,
                fileName,
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
                source: line
            });
        });
    }

    function parseFFOrSafari(error) {
        return error.stack.split('\n').filter(line => !SAFARI_NATIVE_CODE_REGEXP.test(line)).map(line => {
            if (line.includes(' > eval')) {
                line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
            }
            const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
            const matches = line.match(functionNameRegex);
            const functionName = matches && matches[1] ? matches[1] : undefined;
            const locationParts = extractLocation(line.replace(functionNameRegex, ''));

            return new StackFrame({
                functionName,
                fileName: locationParts[0],
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
                source: line
            });
        });
    }

    function parseOpera(error) {
        if (!error.stacktrace || error.message.split('\n').length > error.stacktrace.split('\n').length) {
            return parseOpera9(error);
        } else if (!error.stack) {
            return parseOpera10(error);
        } else {
            return parseOpera11(error);
        }
    }

    function parseOpera9(error) {
        const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        return error.message.split('\n').slice(2).filter((_, i) => i % 2 === 0).map(line => {
            const match = lineRE.exec(line);
            return match ? new StackFrame({ fileName: match[2], lineNumber: match[1], source: line }) : null;
        }).filter(Boolean);
    }

    function parseOpera10(error) {
        const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        return error.stacktrace.split('\n').filter((_, i) => i % 2 === 0).map(line => {
            const match = lineRE.exec(line);
            return match ? new StackFrame({ functionName: match[3], fileName: match[2], lineNumber: match[1], source: line }) : null;
        }).filter(Boolean);
    }

    function parseOpera11(error) {
        return error.stack.split('\n').filter(line => FIREFOX_SAFARI_STACK_REGEXP.test(line) && !/^Error created at/.test(line)).map(line => {
            const tokens = line.split('@');
            const locationParts = extractLocation(tokens.pop());
            const functionCall = tokens.shift() || '';
            const functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, '$2').replace(/\([^)]*\)/g, '') || undefined;
            const argsRaw = functionCall.match(/\(([^)]*)\)/) ? functionCall.replace(/^[^(]+\(([^)]*)\)$/, '$1') : undefined;
            const args = argsRaw === undefined || argsRaw === '[arguments not available]' ? undefined : argsRaw.split(',');

            return new StackFrame({
                functionName,
                args,
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
            } else if (error.stack && CHROME_IE_STACK_REGEXP.test(error.stack)) {
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
        parseOpera9: parseOpera9,
        parseOpera10: parseOpera10,
        parseOpera11: parseOpera11
    };
}));
