(function() {
    'use strict';

    const regex = {
        notString: /[^s]/,
        notBool: /[^t]/,
        notType: /[^T]/,
        notPrimitive: /[^v]/,
        number: /[diefg]/,
        numericArg: /[bcdiefguxX]/,
        jsonType: /[j]/,
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
        return formatParsedString(parseFormatString(key), args);
    }

    function vsprintf(fmt, argv) {
        return sprintf(fmt, ...(argv || []));
    }

    function formatParsedString(parseTree, argv) {
        let cursor = 1;
        let output = '';

        parseTree.forEach(node => {
            if (typeof node === 'string') {
                output += node;
            } else if (typeof node === 'object') {
                let arg = extractArgument(node, argv, cursor);
                
                if (regex.notType.test(node.type) && regex.notPrimitive.test(node.type) && arg instanceof Function) {
                    arg = arg();
                }
                
                formatNodeValue(node, arg);
                output += formatOutput(node, arg);
                
                if (!node.param_no) cursor++;
            }
        });

        return output;
    }
    
    function extractArgument(node, argv, cursor) {
        let arg;
        
        if (node.keys) {
            arg = argv[cursor];
            node.keys.forEach(key => {
                if (arg == undefined) {
                    throw new Error(`[sprintf] Cannot access property "${key}" of undefined value`);
                }
                arg = arg[key];
            });
        } else if (node.param_no) {
            arg = argv[node.param_no];
        } else {
            arg = argv[cursor];
        }
        
        return arg;
    }
    
    function formatNodeValue(node, arg) {
        if (regex.numericArg.test(node.type) && (typeof arg !== 'number' && isNaN(arg))) {
            throw new TypeError(`[sprintf] expecting number but found ${typeof arg}`);
        }
        
        if (regex.number.test(node.type)) {
            node.isPositive = arg >= 0;
        }
        
        switch (node.type) {
            case 'b': arg = parseInt(arg, 10).toString(2); break;
            case 'c': arg = String.fromCharCode(parseInt(arg, 10)); break;
            case 'd':
            case 'i': arg = parseInt(arg, 10); break;
            case 'j': arg = JSON.stringify(arg, null, node.width ? parseInt(node.width) : 0); break;
            case 'e': arg = node.precision ? parseFloat(arg).toExponential(node.precision) : parseFloat(arg).toExponential(); break;
            case 'f': arg = node.precision ? parseFloat(arg).toFixed(node.precision) : parseFloat(arg); break;
            case 'g': arg = node.precision ? Number(arg).toPrecision(node.precision) : parseFloat(arg); break;
            case 'o': arg = (parseInt(arg, 10) >>> 0).toString(8); break;
            case 's':
            case 't':
            case 'T':
            case 'v': arg = String(arg); if (node.precision) arg = arg.substring(0, node.precision); break;
            case 'u': arg = parseInt(arg, 10) >>> 0; break;
            case 'x': arg = (parseInt(arg, 10) >>> 0).toString(16); break;
            case 'X': arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase(); break;
        }
        return arg;
    }
    
    function formatOutput(node, arg) {
        let sign = '';
        let padCharacter = node.pad_char ? (node.pad_char === '0' ? '0' : node.pad_char.charAt(1)) : ' ';
        let padLength = node.width - (node.isPositive ? arg.toString().length : arg.toString().replace(regex.sign, '').length + 1);
        let pad = node.width ? (padLength > 0 ? padCharacter.repeat(padLength) : '') : '';
        
        if (regex.number.test(node.type) && (!node.isPositive || node.sign)) {
            sign = node.isPositive ? '+' : '-';
            arg = arg.toString().replace(regex.sign, '');
        }

        return node.align ? sign + arg + pad : (padCharacter === '0' ? sign + pad + arg : pad + sign + arg);
    }

    const sprintfCache = Object.create(null);

    function parseFormatString(fmt) {
        if (sprintfCache[fmt]) return sprintfCache[fmt];

        let _fmt = fmt;
        const parseTree = [];
        let argNames = 0;

        while (_fmt) {
            let match;
            if ((match = regex.text.exec(_fmt))) {
                parseTree.push(match[0]);
            } else if ((match = regex.modulo.exec(_fmt))) {
                parseTree.push('%');
            } else if ((match = regex.placeholder.exec(_fmt))) {
                if (match[2]) {
                    argNames |= 1;
                    match[2] = parseNamedArguments(match[2]);
                } else {
                    argNames |= 2;
                }
                if (argNames === 3) throw new Error('[sprintf] Mixing positional and named placeholders not supported');

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
                throw new SyntaxError('[sprintf] Unexpected placeholder');
            }
            
            _fmt = _fmt.substring(match[0].length);
        }
        return sprintfCache[fmt] = parseTree;
    }
    
    function parseNamedArguments(replacementField) {
        const fieldList = [];
        let fieldMatch;

        if ((fieldMatch = regex.key.exec(replacementField))) {
            fieldList.push(fieldMatch[1]);
            while ((replacementField = replacementField.substring(fieldMatch[0].length))) {
                if ((fieldMatch = regex.keyAccess.exec(replacementField))) {
                    fieldList.push(fieldMatch[1]);
                } else if ((fieldMatch = regex.indexAccess.exec(replacementField))) {
                    fieldList.push(fieldMatch[1]);
                } else {
                    throw new SyntaxError('[sprintf] Failed to parse named argument key');
                }
            }
        } else {
            throw new SyntaxError('[sprintf] Failed to parse named argument key');
        }
        
        return fieldList;
    }

    // Exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.sprintf = sprintf;
        module.exports.vsprintf = vsprintf;
    }

    if (typeof window !== 'undefined') {
        window.sprintf = sprintf;
        window.vsprintf = vsprintf;

        if (typeof define === 'function' && define.amd) {
            define(function() {
                return { sprintf, vsprintf };
            });
        }
    }
})();
