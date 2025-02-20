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

    function sprintf(format, ...args) {
        return formatString(parseFormat(format), args);
    }

    function vsprintf(format, args = []) {
        return sprintf(format, ...args);
    }

    function formatString(formatTree, args) {
        let cursor = 1, output = '';
        for (const node of formatTree) {
            if (typeof node === 'string') {
                output += node;
            } else {
                let arg;
                if (node.keys) {
                    arg = args[cursor];
                    for (const key of node.keys) {
                        if (arg === undefined) {
                            throw new Error(`[sprintf] Cannot access property "${key}" of undefined value`);
                        }
                        arg = arg[key];
                    }
                } else if (node.param_no) {
                    arg = args[node.param_no];
                } else {
                    arg = args[cursor++];
                }

                if (regex.not_type.test(node.type) && regex.not_primitive.test(node.type) && typeof arg === 'function') {
                    arg = arg();
                }

                if (regex.numeric_arg.test(node.type) && (typeof arg !== 'number' && isNaN(arg))) {
                    throw new TypeError(`[sprintf] expecting number but found ${typeof arg}`);
                }

                switch (node.type) {
                    case 'b': arg = parseInt(arg, 10).toString(2); break;
                    case 'c': arg = String.fromCharCode(parseInt(arg, 10)); break;
                    case 'd': case 'i': arg = parseInt(arg, 10); break;
                    case 'j': arg = JSON.stringify(arg, null, node.width ? parseInt(node.width) : 0); break;
                    case 'e': arg = node.precision ? parseFloat(arg).toExponential(node.precision) : parseFloat(arg).toExponential(); break;
                    case 'f': arg = node.precision ? parseFloat(arg).toFixed(node.precision) : parseFloat(arg); break;
                    case 'g': arg = node.precision ? String(Number(arg.toPrecision(node.precision))) : parseFloat(arg); break;
                    case 'o': arg = (parseInt(arg, 10) >>> 0).toString(8); break;
                    case 's': arg = String(arg); arg = (node.precision ? arg.substring(0, node.precision) : arg); break;
                    case 't': arg = String(!!arg); arg = (node.precision ? arg.substring(0, node.precision) : arg); break;
                    case 'T': arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase(); arg = (node.precision ? arg.substring(0, node.precision) : arg); break;
                    case 'u': arg = parseInt(arg, 10) >>> 0; break;
                    case 'v': arg = arg.valueOf(); arg = (node.precision ? arg.substring(0, node.precision) : arg); break;
                    case 'x': arg = (parseInt(arg, 10) >>> 0).toString(16); break;
                    case 'X': arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase(); break;
                }

                if (!regex.json.test(node.type)) {
                    const isPositive = node.type.match(regex.number) ? arg >= 0 : false;
                    const sign = isPositive && node.sign ? '+' : '';
                    const padChar = node.pad_char ? (node.pad_char === '0' ? '0' : node.pad_char.charAt(1)) : ' ';
                    const padLength = node.width - (sign + arg).length;
                    const pad = node.width ? (padLength > 0 ? padChar.repeat(padLength) : '') : '';
                    output += node.align ? sign + arg + pad : (padChar === '0' ? sign + pad + arg : pad + sign + arg);
                } else {
                    output += arg;
                }
            }
        }
        return output;
    }

    const formatCache = Object.create(null);

    function parseFormat(format) {
        if (formatCache[format]) return formatCache[format];

        const parseTree = [], argNames = { positional: 0, named: 0 };
        let remainingFormat = format, match;

        while (remainingFormat) {
            if ((match = regex.text.exec(remainingFormat)) !== null) {
                parseTree.push(match[0]);
            } else if ((match = regex.modulo.exec(remainingFormat)) !== null) {
                parseTree.push('%');
            } else if ((match = regex.placeholder.exec(remainingFormat)) !== null) {
                if (match[2]) {
                    argNames.named += 1;
                    const fieldList = [];
                    let field = match[2], keyMatch;

                    while (field) {
                        if ((keyMatch = regex.key.exec(field)) !== null) {
                            fieldList.push(keyMatch[1]);
                            field = field.slice(keyMatch[0].length);
                        } else if ((keyMatch = regex.key_access.exec(field)) !== null) {
                            fieldList.push(keyMatch[1]);
                            field = field.slice(keyMatch[0].length);
                        } else if ((keyMatch = regex.index_access.exec(field)) !== null) {
                            fieldList.push(keyMatch[1]);
                            field = field.slice(keyMatch[0].length);
                        } else {
                            throw new SyntaxError('[sprintf] failed to parse named argument key');
                        }
                    }
                    match[2] = fieldList;
                } else {
                    argNames.positional += 1;
                }

                if (argNames.named && argNames.positional) {
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
            remainingFormat = remainingFormat.slice(match[0].length);
        }
        return formatCache[format] = parseTree;
    }

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
