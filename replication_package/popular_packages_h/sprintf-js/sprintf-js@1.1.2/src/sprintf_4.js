/* global window, exports, define */

(function() {
    'use strict';

    const regex = {
        not_string: /[^s]/,
        not_bool: /[^t]/,
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[+-]/
    };

    function sprintf(format) {
        return formatString(parseFormat(format), arguments);
    }

    function vsprintf(format, args) {
        return sprintf.apply(null, [format].concat(args || []));
    }

    function formatString(parseTree, args) {
        let cursor = 1, output = '', i, arg, placeholder;
        parseTree.forEach(node => {
            if (typeof node === 'string') {
                output += node;
            } else if (typeof node === 'object') {
                placeholder = node;
                if (placeholder.keys) {
                    arg = args[cursor];
                    for (let key of placeholder.keys) {
                        if (arg == undefined) {
                            throw new Error(`[sprintf] Cannot access property "${key}" of undefined value`);
                        }
                        arg = arg[key];
                    }
                } else if (placeholder.param_no) {
                    arg = args[placeholder.param_no];
                } else {
                    arg = args[cursor++];
                }

                if (isFunctionPlaceholder(placeholder.type) && arg instanceof Function) {
                    arg = arg();
                }

                if (isNumericPlaceholder(placeholder.type) && isNaN(arg)) {
                    throw new TypeError(`[sprintf] expecting number but found ${typeof arg}`);
                }

                if (regex.number.test(placeholder.type)) {
                    var isPositive = arg >= 0;
                }

                arg = processPlaceholder(arg, placeholder);

                if (regex.json.test(placeholder.type)) {
                    output += arg;
                } else {
                    let sign = '';
                    if (regex.number.test(placeholder.type) && (!isPositive || placeholder.sign)) {
                        sign = isPositive ? '+' : '-';
                        arg = arg.toString().replace(regex.sign, '');
                    }
                    let padCharacter = placeholder.pad_char ? placeholder.pad_char === '0' ? '0' : placeholder.pad_char.charAt(1) : ' ';
                    let padLength = placeholder.width - (sign + arg).length;
                    let pad = placeholder.width ? (padLength > 0 ? padCharacter.repeat(padLength) : '') : '';
                    output += placeholder.align ? sign + arg + pad : (padCharacter === '0' ? sign + pad + arg : pad + sign + arg);
                }
            }
        });
        return output;
    }

    function parseFormat(fmt) {
        if (sprintf_cache[fmt]) {
            return sprintf_cache[fmt];
        }

        let _fmt = fmt, match, parseTree = [], argNames = 0;
        while (_fmt) {
            if ((match = regex.text.exec(_fmt)) !== null) {
                parseTree.push(match[0]);
            } else if ((match = regex.modulo.exec(_fmt)) !== null) {
                parseTree.push('%');
            } else if ((match = regex.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    argNames |= 1;
                    let fieldList = [], replacementField = match[2], fieldMatch = [];
                    if ((fieldMatch = regex.key.exec(replacementField)) !== null) {
                        fieldList.push(fieldMatch[1]);
                        while ((replacementField = replacementField.substring(fieldMatch[0].length)) !== '') {
                            if ((fieldMatch = regex.key_access.exec(replacementField)) !== null) {
                                fieldList.push(fieldMatch[1]);
                            } else if ((fieldMatch = regex.index_access.exec(replacementField)) !== null) {
                                fieldList.push(fieldMatch[1]);
                            } else {
                                throw new SyntaxError('[sprintf] failed to parse named argument key');
                            }
                        }
                    } else {
                        throw new SyntaxError('[sprintf] failed to parse named argument key');
                    }
                    match[2] = fieldList;
                } else {
                    argNames |= 2;
                }
                if (argNames === 3) {
                    throw new Error('[sprintf] mixing positional and named placeholders is not supported');
                }

                parseTree.push({
                    placeholder: match[0],
                    param_no: match[1],
                    keys: match[2],
                    sign: match[3],
                    pad_char: match[4],
                    align: match[5],
                    width: match[6],
                    precision: match[7],
                    type: match[8]
                });
            } else {
                throw new SyntaxError('[sprintf] unexpected placeholder');
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return sprintf_cache[fmt] = parseTree;
    }

    function processPlaceholder(arg, placeholder) {
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
        }
    }

    function isFunctionPlaceholder(type) {
        return regex.not_type.test(type) && regex.not_primitive.test(type);
    }

    function isNumericPlaceholder(type) {
        return regex.numeric_arg.test(type);
    }

    const sprintf_cache = Object.create(null);

    if (typeof exports !== 'undefined') {
        exports['sprintf'] = sprintf;
        exports['vsprintf'] = vsprintf;
    }
    if (typeof window !== 'undefined') {
        window['sprintf'] = sprintf;
        window['vsprintf'] = vsprintf;

        if (typeof define === 'function' && define['amd']) {
            define(function() {
                return {
                    'sprintf': sprintf,
                    'vsprintf': vsprintf
                };
            });
        }
    }
})(); 
