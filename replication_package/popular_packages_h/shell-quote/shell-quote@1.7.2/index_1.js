const CONTROL_CHARS = ['||', '&&', ';;', '|&', '<(', '>>', '>&', '[&;()|<>]'];
const CONTROL_REGEX = new RegExp(`(?:${CONTROL_CHARS.join('|')})`);
const TOKEN_META = '|&;()<> \\t';
const BAREWORD_REGEX = new RegExp(`(\\\\['"${TOKEN_META}]|[^\\s'"${TOKEN_META}])+`);
const SINGLE_QUOTE_REGEX = /"((\\["]|[^"])*?)"/;
const DOUBLE_QUOTE_REGEX = /'((\\['']|[^'])*?)'/;

const TOKEN = Array.from({ length: 4 }, () => (Math.pow(16, 8) * Math.random()).toString(16)).join('');

exports.quote = function (xs) {
    return xs.map(s => {
        if (s && typeof s === 'object') {
            return s.op.replace(/(.)/g, '\\$1');
        } else if (/["\s]/.test(s) && !/'/.test(s)) {
            return `'${s.replace(/(['\\])/g, '\\$1')}'`;
        } else if (/["'\s]/.test(s)) {
            return `"${s.replace(/(["\\$`!])/g, '\\$1')}"`;
        } else {
            return String(s).replace(/([A-z]:)?([#!"$&'()*,:;<=>?@\[\\\]^`{|}])/g, '$1\\$2');
        }
    }).join(' ');
};

exports.parse = function (s, env, opts) {
    const variables = env || {};
    const options = opts || {};

    const match = s.match(new RegExp(`(${CONTROL_REGEX.source})|(${BAREWORD_REGEX.source}|${SINGLE_QUOTE_REGEX.source}|${DOUBLE_QUOTE_REGEX.source})*`, 'g')).filter(Boolean);
    let commented = false;

    if (!match) return [];
    
    return match.map((item, index) => {
        if (commented) return;

        if (CONTROL_REGEX.test(item)) {
            return { op: item };
        }

        let quote = false, escape = false, output = '', isGlob = false;

        for (let i = 0, length = item.length; i < length; i++) {
            const char = item.charAt(i);
            isGlob = isGlob || (!quote && (char === '*' || char === '?'));

            if (escape) {
                output += char;
                escape = false;
            } else if (quote) {
                if (quote === char) {
                    quote = false;
                } else if (quote === `'`) {
                    output += char;
                } else {
                    if (char === '\\') {
                        const nextChar = item.charAt(++i);
                        if (['"', '\\', '$'].includes(nextChar)) {
                            output += nextChar;
                        } else {
                            output += '\\' + nextChar;
                        }
                    } else if (char === '$') {
                        output += parseEnvVariable();
                    } else {
                        output += char;
                    }
                }
            } else if (char === '"' || char === "'") {
                quote = char;
            } else if (CONTROL_REGEX.test(char)) {
                return { op: item };
            } else if (char === '#') {
                commented = true;
                return output.length ? [output, { comment: item.slice(i + 1) + match.slice(index + 1).join(' ') }] : [{ comment: item.slice(i + 1) + match.slice(index + 1).join(' ') }];
            } else if (char === '\\') {
                escape = true;
            } else if (char === '$') {
                output += parseEnvVariable();
            } else {
                output += char;
            }
        }

        if (isGlob) return { op: 'glob', pattern: output };
        return output;
    }).reduce((prev, arg) => arg !== undefined ? prev.concat(arg) : prev, []);

    function parseEnvVariable() {
        let varEnd, varName;
        let startPosition = ++i;

        if (item.charAt(startPosition) === '{') {
            startPosition++;
            if (item.charAt(startPosition) === '}') {
                throw new Error("Bad substitution: " + item.substr(startPosition - 2, 3));
            }
            varEnd = item.indexOf('}', startPosition);
            if (varEnd < 0) {
                throw new Error("Bad substitution: " + item.substr(startPosition));
            }
            varName = item.substring(startPosition, varEnd - startPosition);
            i = varEnd;
        } else if (/[*@#?$!_\-]/.test(item.charAt(startPosition))) {
            varName = item.charAt(startPosition);
            i++;
        } else {
            varEnd = item.substr(startPosition).match(/[^\w\d_]/);
            if (!varEnd) {
                varName = item.substr(startPosition);
                i = item.length;
            } else {
                varName = item.substr(startPosition, varEnd.index);
                i += varEnd.index;
            }
        }
        return resolveVariable(null, '', varName);
    }

    function resolveVariable(_, prefix, key) {
        let result = typeof variables === 'function' ? variables(key) : variables[key];
        if (result === undefined && key !== '') result = '';
        else if (result === undefined) result = '$';

        if (typeof result === 'object') {
            return prefix + TOKEN + JSON.stringify(result) + TOKEN;
        }
        return prefix + result;
    }
}
