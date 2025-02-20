/* global window, exports, define */

(function() {
    'use strict';

    const regexPatterns = {
        notString: /[^s]/,
        notBool: /[^t]/,
        notType: /[^T]/,
        notPrimitive: /[^v]/,
        number: /[diefg]/,
        numericArg: /[bcdiefguxX]/,
        json: /[j]/,
        notJson: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        keyAccess: /^\.([a-z_][a-z_\d]*)/i,
        indexAccess: /^\[(\d+)\]/,
        sign: /^[+-]/
    };

    function sprintf(key, ...args) {
        return sprintfFormat(parseFormatString(key), args);
    }

    function vsprintf(fmt, argv) {
        return sprintf(fmt, ...(argv || []));
    }

    function sprintfFormat(parseTree, argv) {
        let cursor = 0, output = '';
        for (const segment of parseTree) {
            if (typeof segment === 'string') {
                output += segment;
            } else if (typeof segment === 'object') {
                let arg = getArgumentValue(segment, argv, cursor);
                if (regexPatterns.notType.test(segment.type) && regexPatterns.notPrimitive.test(segment.type) && arg instanceof Function) {
                    arg = arg();
                }

                if (regexPatterns.numericArg.test(segment.type) && isNaN(arg)) {
                    throw new TypeError(`[sprintf] expecting number but found ${typeof arg}`);
                }

                const isPositive = regexPatterns.number.test(segment.type) ? arg >= 0 : true;
                arg = formatArgument(arg, segment);
                
                output += handlePaddingAndSign(arg, segment, isPositive);
                if (!segment.keys) cursor++;
            }
        }
        return output;
    }

    function getArgumentValue(ph, argv, cursor) {
        let arg;
        if (ph.keys) {
            arg = argv[cursor];
            for (const key of ph.keys) {
                if (arg == undefined) {
                    throw new Error(`[sprintf] Cannot access property "${key}" of undefined value "${ph.keys.join('.')}"`);
                }
                arg = arg[key];
            }
        } else if (ph.param_no) {
            arg = argv[ph.param_no - 1];
        } else {
            arg = argv[cursor];
        }
        return arg;
    }

    function formatArgument(arg, ph) {
        switch (ph.type) {
            case 'b': return parseInt(arg, 10).toString(2);
            case 'c': return String.fromCharCode(parseInt(arg, 10));
            case 'd':
            case 'i': return parseInt(arg, 10);
            case 'j': return JSON.stringify(arg, null, ph.width ? parseInt(ph.width) : 0);
            case 'e': return parseFloat(arg).toExponential(ph.precision || undefined);
            case 'f': return ph.precision ? parseFloat(arg).toFixed(ph.precision) : parseFloat(arg);
            case 'g': return ph.precision ? String(Number(arg.toPrecision(ph.precision))) : parseFloat(arg);
            case 'o': return (parseInt(arg, 10) >>> 0).toString(8);
            case 's': return ph.precision ? String(arg).substring(0, ph.precision) : String(arg);
            case 't': return ph.precision ? String(!!arg).substring(0, ph.precision) : String(!!arg);
            case 'T': return ph.precision ? Object.prototype.toString.call(arg).slice(8, -1).toLowerCase().substring(0, ph.precision) : Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
            case 'u': return parseInt(arg, 10) >>> 0;
            case 'v': return ph.precision ? arg.valueOf().substring(0, ph.precision) : arg.valueOf();
            case 'x': return (parseInt(arg, 10) >>> 0).toString(16);
            case 'X': return (parseInt(arg, 10) >>> 0).toString(16).toUpperCase();
            default: return arg;
        }
    }

    function handlePaddingAndSign(arg, ph, isPositive) {
        let sign = '';
        if (regexPatterns.number.test(ph.type) && (!isPositive || ph.sign)) {
            sign = isPositive ? '+' : '-';
            arg = arg.toString().replace(regexPatterns.sign, '');
        }
        const padChar = ph.pad_char ? (ph.pad_char === '0' ? '0' : ph.pad_char.charAt(1)) : ' ';
        const padLength = ph.width - (sign + arg).length;
        const padding = ph.width ? (padLength > 0 ? padChar.repeat(padLength) : '') : '';
        return ph.align ? sign + arg + padding : padChar === '0' ? sign + padding + arg : padding + sign + arg;
    }

    const sprintfCache = Object.create(null);

    function parseFormatString(fmt) {
        if (sprintfCache[fmt]) return sprintfCache[fmt];

        let remainingFmt = fmt, parseTree = [], mixNamedAndPositional = 0;
        while (remainingFmt) {
            let match;
            if ((match = regexPatterns.text.exec(remainingFmt)) !== null) {
                parseTree.push(match[0]);
            } else if ((match = regexPatterns.modulo.exec(remainingFmt)) !== null) {
                parseTree.push('%');
            } else if ((match = regexPatterns.placeholder.exec(remainingFmt)) !== null) {
                const { placeholder, param_no, keys, sign, pad_char, align, width, precision, type } = match.groups;
                if (keys) {
                    mixNamedAndPositional |= 1;
                    const fieldList = parseFieldList(keys);
                    match.groups.keys = fieldList;
                } else {
                    mixNamedAndPositional |= 2;
                }
                if (mixNamedAndPositional === 3) {
                    throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported');
                }
                parseTree.push({ placeholder, param_no, keys: match.groups.keys, sign, pad_char, align, width, precision, type });
            } else {
                throw new SyntaxError('[sprintf] unexpected placeholder');
            }
            remainingFmt = remainingFmt.substring(match[0].length);
        }
        return sprintfCache[fmt] = parseTree;
    }

    function parseFieldList(replacementField) {
        const fieldList = [];
        let fieldMatch;
        while (replacementField) {
            if ((fieldMatch = regexPatterns.key.exec(replacementField)) !== null) {
                fieldList.push(fieldMatch[1]);
                replacementField = replacementField.substring(fieldMatch[0].length);
            } else if ((fieldMatch = regexPatterns.keyAccess.exec(replacementField)) !== null) {
                fieldList.push(fieldMatch[1]);
                replacementField = replacementField.substring(fieldMatch[0].length);
            } else if ((fieldMatch = regexPatterns.indexAccess.exec(replacementField)) !== null) {
                fieldList.push(fieldMatch[1]);
                replacementField = replacementField.substring(fieldMatch[0].length);
            } else {
                throw new SyntaxError('[sprintf] failed to parse named argument key');
            }
        }
        return fieldList;
    }

    /* Export functions for either Browser or Node.js environment */
    if (typeof exports !== 'undefined') {
        exports.sprintf = sprintf;
        exports.vsprintf = vsprintf;
    }
    if (typeof window !== 'undefined') {
        window.sprintf = sprintf;
        window.vsprintf = vsprintf;
        if (typeof define === 'function' && define.amd) {
            define(() => ({ sprintf, vsprintf }));
        }
    }
})();
