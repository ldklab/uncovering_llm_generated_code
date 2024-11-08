(function (root, factory) {
    'use strict';

    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory(require('stackframe'));
    } else if (typeof define === 'function' && define.amd) {
        define(['stackframe'], factory);
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function (StackFrame) {
    'use strict';

    const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
    const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
    const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

    const parseError = {
        parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && CHROME_IE_STACK_REGEXP.test(error.stack)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        extractLocation(urlLike) {
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }
            const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
            const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE(error) {
            return error.stack.split('\n').filter(line => CHROME_IE_STACK_REGEXP.test(line))
                .map(line => {
                    if (line.includes('(eval ')) {
                        line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(,.*$)/g, '');
                    }
                    const sanitizedLine = line.trim().replace(/\(eval code/g, '(').replace(/^.*?\s+/, '');
                    const location = sanitizedLine.match(/ (\(.+\)$)/);
                    const locationParts = this.extractLocation(location ? location[1] : sanitizedLine);
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
        },

        parseFFOrSafari(error) {
            return error.stack.split('\n').filter(line => !SAFARI_NATIVE_CODE_REGEXP.test(line))
                .map(line => {
                    if (line.includes(' > eval')) {
                        line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
                    }

                    if (!line.includes('@') && !line.includes(':')) {
                        return new StackFrame({ functionName: line });
                    } else {
                        const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                        const matches = line.match(functionNameRegex);
                        const functionName = matches?.[1];
                        const locationParts = this.extractLocation(line.replace(functionNameRegex, ''));

                        return new StackFrame({
                            functionName: functionName,
                            fileName: locationParts[0],
                            lineNumber: locationParts[1],
                            columnNumber: locationParts[2],
                            source: line
                        });
                    }
                });
        },

        parseOpera(e) {
            if (!e.stacktrace || (e.message.includes('\n') && e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9(e) {
            const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            return e.message.split('\n').slice(2).reduce((result, line, index) => {
                if (index % 2 == 0) {
                    const match = lineRE.exec(line);
                    if (match) {
                        result.push(new StackFrame({
                            fileName: match[2],
                            lineNumber: match[1],
                            source: line
                        }));
                    }
                }
                return result;
            }, []);
        },

        parseOpera10(e) {
            const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            return e.stacktrace.split('\n').reduce((result, line, index) => {
                if (index % 2 == 0) {
                    const match = lineRE.exec(line);
                    if (match) {
                        result.push(new StackFrame({
                            functionName: match[3],
                            fileName: match[2],
                            lineNumber: match[1],
                            source: line
                        }));
                    }
                }
                return result;
            }, []);
        },

        parseOpera11(error) {
            return error.stack.split('\n').filter(line => FIREFOX_SAFARI_STACK_REGEXP.test(line) && !line.startsWith('Error created at'))
                .map(line => {
                    const [functionStr, locationStr] = line.split('@');
                    const locationParts = this.extractLocation(locationStr);
                    const functionName = functionStr.replace(/<anonymous function(: (\w+))?>/, '$2').replace(/\([^)]*\)/g, '') || undefined;
                    const argsRaw = functionStr.match(/\(([^)]*)\)/)?.[1];
                    const args = argsRaw && argsRaw !== '[arguments not available]' ? argsRaw.split(',') : undefined;

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
    };

    return parseError;
}));
