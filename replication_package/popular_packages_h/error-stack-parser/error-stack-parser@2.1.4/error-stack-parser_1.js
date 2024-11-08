(function(globalScope, factoryFunction) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('error-stack-parser', ['stackframe'], factoryFunction);
    } else if (typeof exports === 'object') {
        module.exports = factoryFunction(require('stackframe'));
    } else {
        globalScope.ErrorStackParser = factoryFunction(globalScope.StackFrame);
    }
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    const REGEXP_FIREFOX_SAFARI = /(^|@)\S+:\d+/;
    const REGEXP_CHROME_IE = /^\s*at .*(\S+:\d+|\(native\))/m;
    const REGEXP_SAFARI_NATIVE_CODE = /^(eval@)?(\[native code])?$/;

    return {
        parse: function parseError(error) {
            if (error.stacktrace || error['opera#sourceloc']) {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(REGEXP_CHROME_IE)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        extractLocation: function parseLocation(urlLike) {
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
            const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function parseV8OrIE(error) {
            const lines = error.stack.split('\n').filter(line => line.match(REGEXP_CHROME_IE));

            return lines.map(line => {
                if (line.indexOf('(eval ') > -1) {
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(,.*$)/g, '');
                }
                let sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').replace(/^.*?\s+/, '');
                const location = sanitizedLine.match(/ (\(.+\)$)/);
                sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;
                const locationParts = this.extractLocation(location ? location[1] : sanitizedLine);
                const functionName = location && sanitizedLine || undefined;
                const fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame({
                    functionName,
                    fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFFOrSafari: function parseFFOrSafari(error) {
            const lines = error.stack.split('\n').filter(line => !line.match(REGEXP_SAFARI_NATIVE_CODE));

            return lines.map(line => {
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
                }
                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    return new StackFrame({ functionName: line });
                } else {
                    const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                    const matches = line.match(functionNameRegex);
                    const functionName = matches && matches[1] ? matches[1] : undefined;
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

        parseOpera: function parseOperaMethod(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function parseOpera9Method(e) {
            const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            const lines = e.message.split('\n');
            const result = [];

            for (let i = 2, len = lines.length; i < len; i += 2) {
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

        parseOpera10: function parseOpera10Method(e) {
            const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            const lines = e.stacktrace.split('\n');
            const result = [];

            for (let i = 0, len = lines.length; i < len; i += 2) {
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
        },

        parseOpera11: function parseOpera11Method(error) {
            const lines = error.stack.split('\n').filter(line => line.match(REGEXP_FIREFOX_SAFARI) && !line.match(/^Error created at/));

            return lines.map(line => {
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
}));
