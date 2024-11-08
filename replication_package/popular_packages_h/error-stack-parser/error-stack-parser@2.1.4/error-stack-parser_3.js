(function (root, factory) {
    'use strict';
    
    // UMD Pattern
    if (typeof define === 'function' && define.amd) {
        define('error-stack-parser', ['stackframe'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('stackframe'));
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function (StackFrame) {
    'use strict';

    const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
    const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
    const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

    function extractLocation(urlLike) {
        if (urlLike.indexOf(':') === -1) {
            return [urlLike];
        }

        const parts = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(urlLike.replace(/[()]/g, ''));
        return [parts[1], parts[2], parts[3]];
    }

    function parseV8OrIE(error) {
        const filtered = error.stack.split('\n').filter(line => CHROME_IE_STACK_REGEXP.test(line));

        return filtered.map(line => {
            if (line.includes('(eval ')) {
                line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(,.*$)/g, '');
            }
            const sanitizedLine = line.replace(/^\s+/g, '').replace(/^\s*(\S*\s+)?/, '');
            const locationMatch = sanitizedLine.match(/ (\(.+\)$)/);
            const location = locationMatch ? locationMatch[1] : sanitizedLine;

            const [fileName, lineNumber, columnNumber] = extractLocation(location);
            const functionName = locationMatch ? sanitizedLine.replace(locationMatch[0], '') : undefined;

            return new StackFrame({ functionName, fileName, lineNumber, columnNumber, source: line });
        });
    }

    function parseFFOrSafari(error) {
        const filtered = error.stack.split('\n').filter(line => !SAFARI_NATIVE_CODE_REGEXP.test(line));

        return filtered.map(line => {
            if (line.includes(' > eval')) {
                line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
            }

            if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                return new StackFrame({ functionName: line });
            } else {
                const functionNameMatch = line.match(/^(.*?)(?:@|\s)/);
                const functionName = functionNameMatch && functionNameMatch[1];
                const location = line.replace(/^.+@|\s.+$/g, '');

                const [fileName, lineNumber, columnNumber] = extractLocation(location);

                return new StackFrame({ functionName, fileName, lineNumber, columnNumber, source: line });
            }
        });
    }

    function parseOpera(e) {
        if (!e.stacktrace || (e.message.split('\n').length > e.stacktrace.split('\n').length)) {
            return parseOpera9(e);
        } else if (!e.stack) {
            return parseOpera10(e);
        } else {
            return parseOpera11(e);
        }
    }

    function parseOpera9(e) {
        const lines = e.message.split('\n');
        return lines.reduce((frames, line, index) => {
            if (index % 2 === 0) return frames;
            const match = /Line (\d+).*script (?:in )?(\S+)/i.exec(line);
            if (match) {
                frames.push(new StackFrame({ fileName: match[2], lineNumber: match[1], source: line }));
            }
            return frames;
        }, []);
    }

    function parseOpera10(e) {
        const lines = e.stacktrace.split('\n');
        return lines.reduce((frames, line, index) => {
            if (index % 2 !== 0) return frames;
            const match = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?/i.exec(line);
            if (match) {
                frames.push(new StackFrame({ functionName: match[3], fileName: match[2], lineNumber: match[1], source: line }));
            }
            return frames;
        }, []);
    }

    function parseOpera11(error) {
        const filtered = error.stack.split('\n').filter(line =>
            FIREFOX_SAFARI_STACK_REGEXP.test(line) && !line.startsWith('Error created at')
        );

        return filtered.map(line => {
            const [functionNamePart, location] = line.split('@');
            const functionName = functionNamePart.replace(/<anonymous function(: (\w+))?>/, '$2').replace(/\(.*\)/, '').trim();
            const [fileName, lineNumber, columnNumber] = extractLocation(location);

            return new StackFrame({ functionName, fileName, lineNumber, columnNumber, source: line });
        });
    }

    return {
        parse: function (error) {
            if (error.stacktrace || error['opera#sourceloc']) {
                return parseOpera(error);
            } else if (error.stack) {
                if (CHROME_IE_STACK_REGEXP.test(error.stack)) {
                    return parseV8OrIE(error);
                } else {
                    return parseFFOrSafari(error);
                }
            }
            throw new Error('Cannot parse given Error object');
        }
    };
}));
