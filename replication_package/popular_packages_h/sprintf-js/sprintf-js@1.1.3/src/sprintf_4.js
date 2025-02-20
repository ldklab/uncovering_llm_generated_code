(function() {
    'use strict';

    const re = {
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
        return sprintfFormat(sprintfParse(key), arguments);
    }

    function vsprintf(fmt, argv) {
        return sprintf.apply(null, [fmt].concat(argv || []));
    }

    function sprintfFormat(parseTree, argv) {
        let cursor = 1;
        let output = '';
        for (let i = 0; i < parseTree.length; i++) {
            const part = parseTree[i];
            if (typeof part === 'string') {
                output += part;
            } else if (typeof part === 'object') {
                let val;
                if (part.keys) {
                    val = getObjectValue(argv[cursor], part.keys);
                } else if (part.paramNo) {
                    val = argv[part.paramNo];
                } else {
                    val = argv[cursor++];
                }
                output += formatPlaceholder(part, val);
            }
        }
        return output;
    }

    function getObjectValue(obj, keys) {
        for (let k = 0; k < keys.length; k++) {
            obj = obj[keys[k]];
            if (obj === undefined) {
                throw new Error(`Cannot access property "${keys[k]}" of undefined value`);
            }
        }
        return obj;
    }

    function formatPlaceholder(ph, arg) {
        if (re.notType.test(ph.type) && re.notPrimitive.test(ph.type) && arg instanceof Function) {
            arg = arg();
        }

        if (re.numericArg.test(ph.type) && (typeof arg !== 'number' && isNaN(arg))) {
            throw new TypeError(`Expecting number but found ${arg}`);
        }

        let isPositive = true;
        if (re.number.test(ph.type)) {
            isPositive = arg >= 0;
        }

        switch (ph.type) {
            case 'b': arg = parseInt(arg, 10).toString(2); break;
            case 'c': arg = String.fromCharCode(parseInt(arg, 10)); break;
            case 'd':
            case 'i': arg = parseInt(arg, 10); break;
            case 'j': arg = JSON.stringify(arg, null, ph.width ? parseInt(ph.width) : 0); break;
            case 'e': arg = ph.precision ? parseFloat(arg).toExponential(ph.precision) : parseFloat(arg).toExponential(); break;
            case 'f': arg = ph.precision ? parseFloat(arg).toFixed(ph.precision) : parseFloat(arg); break;
            case 'g': arg = ph.precision ? String(Number(arg.toPrecision(ph.precision))) : parseFloat(arg); break;
            case 'o': arg = (parseInt(arg, 10) >>> 0).toString(8); break;
            case 's': arg = String(arg).substring(0, ph.precision); break;
            case 't': arg = String(!!arg).substring(0, ph.precision); break;
            case 'T': arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase().substring(0, ph.precision); break;
            case 'u': arg = parseInt(arg, 10) >>> 0; break;
            case 'v': arg = arg.valueOf().substring(0, ph.precision); break;
            case 'x': arg = (parseInt(arg, 10) >>> 0).toString(16); break;
            case 'X': arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase(); break;
        }

        if (re.json.test(ph.type)) {
            return arg;
        } else {
            const sign = (!isPositive || ph.sign) ? (isPositive ? '+' : '-') : '';
            const padChar = ph.padChar ? (ph.padChar === '0' ? '0' : ph.padChar.charAt(1)) : ' ';
            const padLength = ph.width - (sign + arg).length;
            const pad = ph.width ? (padLength > 0 ? padChar.repeat(padLength) : '') : '';
            return ph.align ? sign + arg + pad : (padChar === '0' ? sign + pad + arg : pad + sign + arg);
        }
    }

    const sprintfCache = Object.create(null);

    function sprintfParse(fmt) {
        if (sprintfCache[fmt]) {
            return sprintfCache[fmt];
        }

        let _fmt = fmt;
        const parseTree = [];
        let argNames = 0;
        let match;

        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parseTree.push(match[0]);
            } else if ((match = re.modulo.exec(_fmt)) !== null) {
                parseTree.push('%');
            } else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) { // named placeholders
                    argNames |= 1;
                    match[2] = parseKeys(match[2]);
                } else {
                    argNames |= 2;
                }
                if (argNames === 3) {
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
            } else {
                throw new SyntaxError('Unexpected placeholder');
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return sprintfCache[fmt] = parseTree;
    }

    function parseKeys(replacementField) {
        const fieldList = [];
        let fieldMatch;
        if ((fieldMatch = re.key.exec(replacementField)) !== null) {
            fieldList.push(fieldMatch[1]);
            while ((replacementField = replacementField.substring(fieldMatch[0].length)) !== '') {
                if ((fieldMatch = re.keyAccess.exec(replacementField)) !== null) {
                    fieldList.push(fieldMatch[1]);
                } else if ((fieldMatch = re.indexAccess.exec(replacementField)) !== null) {
                    fieldList.push(fieldMatch[1]);
                } else {
                    throw new SyntaxError('Failed to parse named argument key');
                }
            }
        } else {
            throw new SyntaxError('Failed to parse named argument key');
        }
        return fieldList;
    }

    if (typeof exports !== 'undefined') {
        exports.sprintf = sprintf;
        exports.vsprintf = vsprintf;
    }
    if (typeof window !== 'undefined') {
        window.sprintf = sprintf;
        window.vsprintf = vsprintf;
        if (typeof define === 'function' && define.amd) {
            define(() => ({
                sprintf,
                vsprintf
            }));
        }
    }
})();
