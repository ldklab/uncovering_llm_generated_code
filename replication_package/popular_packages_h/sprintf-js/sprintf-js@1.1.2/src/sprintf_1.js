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

    function sprintf(key) {
        return sprintfFormat(parseFormat(key), arguments);
    }

    function vsprintf(fmt, argv) {
        return sprintf.apply(null, [fmt].concat(argv || []));
    }

    function sprintfFormat(parseTree, argv) {
        let cursor = 1, output = '';

        parseTree.forEach((node) => {
            if (typeof node === 'string') {
                output += node;
            } else if (typeof node === 'object') {
                let arg = fetchArgument(node, cursor, argv);
                arg = formatArgument(arg, node);

                if (!regexPatterns.json.test(node.type)) {
                    const { sign, paddedArg } = applyPadding(arg, node);
                    output += node.align ? sign + paddedArg : paddedArg;
                } else {
                    output += arg;
                }
            }
        });
        return output;
    }

    function fetchArgument(placeholder, cursor, argv) {
        if (placeholder.keys) {
            // Handling named arguments
            let arg = argv[cursor];
            placeholder.keys.forEach(key => {
                if (arg === undefined) {
                    throw new Error(`Cannot access property "${key}" of undefined value`);
                }
                arg = arg[key];
            });
            return arg;
        }
        if (placeholder.paramNo) {
            // Explicit positional argument
            return argv[placeholder.paramNo];
        }
        // Implicit positional argument
        return argv[cursor++];
    }

    function formatArgument(arg, placeholder) {
        if (regexPatterns.notType.test(placeholder.type) && regexPatterns.notPrimitive.test(placeholder.type) && typeof arg === 'function') {
            arg = arg();
        }
        if (regexPatterns.numericArg.test(placeholder.type) && (typeof arg !== 'number' && isNaN(arg))) {
            throw new TypeError(`Expecting number but found ${typeof arg}`);
        }

        switch (placeholder.type) {
            case 'b': return parseInt(arg, 10).toString(2);
            case 'c': return String.fromCharCode(parseInt(arg, 10));
            case 'd':
            case 'i': return parseInt(arg, 10);
            case 'j': return JSON.stringify(arg, null, placeholder.width ? parseInt(placeholder.width) : 0);
            case 'e': return placeholder.precision ? parseFloat(arg).toExponential(placeholder.precision) : parseFloat(arg).toExponential();
            case 'f': return placeholder.precision ? parseFloat(arg).toFixed(placeholder.precision) : parseFloat(arg);
            case 'g': return placeholder.precision ? String(Number(arg.toPrecision(placeholder.precision))) : parseFloat(arg);
            case 'o': return (parseInt(arg, 10) >>> 0).toString(8);
            case 's': return placeholder.precision ? String(arg).substring(0, placeholder.precision) : String(arg);
            case 't': return placeholder.precision ? String(!!arg).substring(0, placeholder.precision) : String(!!arg);
            case 'T': return placeholder.precision ? Object.prototype.toString.call(arg).slice(8, -1).toLowerCase().substring(0, placeholder.precision) : Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
            case 'u': return parseInt(arg, 10) >>> 0;
            case 'v': return placeholder.precision ? arg.valueOf().substring(0, placeholder.precision) : arg.valueOf();
            case 'x': return (parseInt(arg, 10) >>> 0).toString(16);
            case 'X': return (parseInt(arg, 10) >>> 0).toString(16).toUpperCase();
            default: return arg;
        }
    }

    function applyPadding(arg, placeholder) {
        let sign = '', isPositive = true;
        if (regexPatterns.number.test(placeholder.type)) {
            isPositive = arg >= 0;
            if (!isPositive || placeholder.sign) {
                sign = isPositive ? '+' : '-';
                arg = arg.toString().replace(regexPatterns.sign, '');
            }
        }
        const padChar = placeholder.padChar ? (placeholder.padChar === '0' ? '0' : placeholder.padChar[1]) : ' ';
        const padLength = placeholder.width - (sign + arg).length;
        const pad = (padLength > 0 ? padChar.repeat(padLength) : '');
        const paddedArg = placeholder.align ? sign + arg + pad : (padChar === '0' ? sign + pad + arg : pad + sign + arg);
        return { sign, paddedArg };
    }

    const sprintfCache = Object.create(null);

    function parseFormat(fmt) {
        if (sprintfCache[fmt]) {
            return sprintfCache[fmt];
        }

        let remainingFmt = fmt;
        const parseTree = [], argNames = new Set();
        let match;

        while (remainingFmt) {
            if ((match = regexPatterns.text.exec(remainingFmt))) {
                parseTree.push(match[0]);
            } else if ((match = regexPatterns.modulo.exec(remainingFmt))) {
                parseTree.push('%');
            } else if ((match = regexPatterns.placeholder.exec(remainingFmt))) {
                parsePlaceholder(match, parseTree, argNames);
            } else {
                throw new SyntaxError('Unexpected placeholder');
            }
            remainingFmt = remainingFmt.substring(match[0].length);
        }
        return sprintfCache[fmt] = parseTree;
    }

    function parsePlaceholder(match, parseTree, argNames) {
        if (match[2]) {
            handleNamedPlaceholder(match, parseTree, argNames);
        } else {
            argNames.add('positional');
        }

        if (argNames.size > 1) {
            throw new Error('Mixing positional and named placeholders is not supported');
        }

        parseTree.push({
            placeholder: match[0],
            paramNo: match[1],
            keys: match[2],
            sign: match[3],
            padChar: match[4],
            align: match[5],
            width: match[6],
            precision: match[7],
            type: match[8]
        });
    }

    function handleNamedPlaceholder(match, parseTree, argNames) {
        argNames.add('named');
        const fields = [], replacementField = match[2];
        let fieldMatch;

        while (replacementField) {
            if ((fieldMatch = regexPatterns.key.exec(replacementField))) {
                fields.push(fieldMatch[1]);
                replacementField = replacementField.substring(fieldMatch[0].length);

                while (replacementField) {
                    if ((fieldMatch = regexPatterns.keyAccess.exec(replacementField))) {
                        fields.push(fieldMatch[1]);
                        replacementField = replacementField.substring(fieldMatch[0].length);
                    } else if ((fieldMatch = regexPatterns.indexAccess.exec(replacementField))) {
                        fields.push(fieldMatch[1]);
                        replacementField = replacementField.substring(fieldMatch[0].length);
                    } else {
                        throw new SyntaxError('Failed to parse named argument key');
                    }
                }
            } else {
                throw new SyntaxError('Failed to parse named argument key');
            }
        }
        match[2] = fields;
    }

    // Export functions for Node.js or browser environments
    if (typeof exports !== 'undefined') {
        exports.sprintf = sprintf;
        exports.vsprintf = vsprintf;
    }
    if (typeof window !== 'undefined') {
        window.sprintf = sprintf;
        window.vsprintf = vsprintf;

        if (typeof define === 'function' && define.amd) {
            define(() => ({
                sprintf: sprintf,
                vsprintf: vsprintf
            }));
        }
    }
})();
