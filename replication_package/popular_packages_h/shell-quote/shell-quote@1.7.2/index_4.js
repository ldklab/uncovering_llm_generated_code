exports.quote = function (strings) {
    return strings.map(quoteString).join(' ');
};

function quoteString(s) {
    if (s && typeof s === 'object') {
        return s.op.replace(/(.)/g, '\\$1');
    } else if (/["\s]/.test(s) && !/'/.test(s)) {
        return `'${s.replace(/(['\\])/g, '\\$1')}'`;
    } else if (/["'\s]/.test(s)) {
        return `"${s.replace(/(["\\$`!])/g, '\\$1')}"`;
    } else {
        return String(s).replace(/([A-z]:)?([#!"$&'()*,:;<=>?@\[\\\]^`{|}])/g, '$1\\$2');
    }
}

const CONTROL = '(?:' + [
    '\\|\\|', '\\&\\&', ';;', '\\|\\&', '\\<\\(', '>>', '>\\&', '[&;()|<>]'
].join('|') + ')';
const META = '|&;()<> \\t';
const BAREWORD = '(\\\\[\'"' + META + ']|[^\\s\'"' + META + '])+';
const SINGLE_QUOTE = '"((\\\\"|[^"])*?)"';
const DOUBLE_QUOTE = '\'((\\\\\'|[^\'])*?)\'';

let TOKEN = '';
for (let i = 0; i < 4; i++) {
    TOKEN += (Math.pow(16,8)*Math.random()).toString(16);
}

exports.parse = function (str, env, opts) {
    const parsedTokens = tokenize(str, env, opts);
    return typeof env !== 'function' ? parsedTokens : replaceEnvironmentVariables(parsedTokens, env);
};

function tokenize(str, env, opts) {
    const chunker = new RegExp([`(${CONTROL})`, `(${BAREWORD}|${SINGLE_QUOTE}|${DOUBLE_QUOTE})*`].join('|'), 'g');
    const matches = str.match(chunker) ?? [];
    let isCommented = false;

    return matches.map((token, idx) => {
        if (isCommented) return;
        if (new RegExp(`^${CONTROL}$`).test(token)) return { op: token };

        const parseResult = parseToken(token, idx, matches, opts, env, isCommented);
        if (parseResult.isCommented) isCommented = true;
        return parseResult.token;
    }).filter(Boolean);
}

function parseToken(token, idx, matches, opts = {}, env) {
    const SINGLE_QUOTE = "'";
    const DOUBLE_QUOTE = '"';
    const DOLLAR_SIGN = '$';
    const BACKSLASH = opts.escape || '\\';
    let isQuoted = false;
    let isEscaped = false;
    let output = '';
    let isGlobPattern = false;
    let isCommented = false;

    for (let i = 0, len = token.length; i < len; i++) {
        const char = token.charAt(i);
        isGlobPattern = isGlobPattern || (!isQuoted && (char === '*' || char === '?'));

        if (isEscaped) {
            output += char;
            isEscaped = false;
        } else if (isQuoted) {
            if (char === isQuoted) {
                isQuoted = false;
            } else if (isQuoted === SINGLE_QUOTE) {
                output += char;
            } else { // Double-quoted
                if (char === BACKSLASH) {
                    i += 1;
                    const nextChar = token.charAt(i);
                    output += (nextChar === DOUBLE_QUOTE || nextChar === BACKSLASH || nextChar === DOLLAR_SIGN) ? nextChar : BACKSLASH + nextChar;
                } else if (char === DOLLAR_SIGN) {
                    output += parseEnvironmentVariable();
                } else {
                    output += char;
                }
            }
        } else if (char === DOUBLE_QUOTE || char === SINGLE_QUOTE) {
            isQuoted = char;
        } else if (new RegExp(`^${CONTROL}$`).test(char)) {
            return { token: { op: token }, isCommented };
        } else if (char === '#') {
            isCommented = true;
            if (output.length) {
                return { token: [output, { comment: token.slice(i+1) + matches.slice(idx+1).join(' ') }], isCommented: true };
            }
            return { token: { comment: token.slice(i+1) + matches.slice(idx+1).join(' ') }, isCommented: true };
        } else if (char === BACKSLASH) {
            isEscaped = true;
        } else if (char === DOLLAR_SIGN) {
            output += parseEnvironmentVariable();
        } else {
            output += char;
        }
    }

    if (isGlobPattern) return { token: { op: 'glob', pattern: output }, isCommented };
    return { token: output, isCommented };

    function parseEnvironmentVariable() {
        i += 1;
        let variableName;
        
        if (token.charAt(i) === '{') {
            i += 1;
            const end = token.indexOf('}', i);
            if (end < 0) throw new Error("Bad substitution: " + token.substr(i));
            variableName = token.substring(i, end);
            i = end;
        } else if (/[*@#?$!_\-]/.test(token.charAt(i))) {
            variableName = token.charAt(i);
            i += 1;
        } else {
            variableName = token.substr(i).match(/^[\w\d_]+/)[0];
            i += variableName.length - 1;
        }
        return getVariableValue(variableName);
    }
}

function replaceEnvironmentVariables(tokens, env) {
    return tokens.reduce((acc, token) => {
        if (typeof token === 'object') return acc.concat(token);
        const parts = token.split(new RegExp(`(${TOKEN}.*?${TOKEN})`, 'g'));
        return acc.concat(parts.map(part => new RegExp(`^${TOKEN}`).test(part) ? JSON.parse(part.slice(TOKEN.length, -TOKEN.length)) : part));
    }, []);
}

function getVariableValue(variableName) {
    const value = typeof env === 'function' ? env(variableName) : env[variableName];
    return (value !== undefined) ? formatOutput(value) : '$';
}

function formatOutput(value) {
    return typeof value === 'object' ? `${TOKEN}${JSON.stringify(value)}${TOKEN}` : value;
}
