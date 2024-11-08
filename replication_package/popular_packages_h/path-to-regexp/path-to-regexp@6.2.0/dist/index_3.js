"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathToRegexp = exports.tokensToRegexp = exports.regexpToFunction = exports.match = exports.tokensToFunction = exports.compile = exports.parse = void 0;

function lexer(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        const char = str[i];
        switch (char) {
            case '*':
            case '+':
            case '?':
                tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
                break;
            case '\\':
                tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
                break;
            case '{':
                tokens.push({ type: "OPEN", index: i, value: str[i++] });
                break;
            case '}':
                tokens.push({ type: "CLOSE", index: i, value: str[i++] });
                break;
            case ':':
                let name = "", j = i + 1;
                while (j < str.length) {
                    const code = str.charCodeAt(j);
                    if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95) {
                        name += str[j++];
                    } else break;
                }
                if (!name) throw new TypeError(`Missing parameter name at ${i}`);
                tokens.push({ type: "NAME", index: i, value: name });
                i = j;
                break;
            case '(':
                let count = 1, pattern = "", j = i + 1;
                if (str[j] === '?') throw new TypeError(`Pattern cannot start with "?" at ${j}`);
                while (j < str.length) {
                    if (str[j] === '\\') {
                        pattern += str[j++] + str[j++];
                    } else if (str[j] === ')') {
                        if (--count === 0) { j++; break; }
                    } else if (str[j] === '(') {
                        if (str[j + 1] !== '?') throw new TypeError(`Capturing groups are not allowed at ${j}`);
                        count++;
                    } else {
                        pattern += str[j++];
                    }
                }
                if (count) throw new TypeError(`Unbalanced pattern at ${i}`);
                if (!pattern) throw new TypeError(`Missing pattern at ${i}`);
                tokens.push({ type: "PATTERN", index: i, value: pattern });
                i = j;
                break;
            default:
                tokens.push({ type: "CHAR", index: i, value: str[i++] });
        }
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}

function parse(str, options = {}) {
    const tokens = lexer(str);
    const prefixes = options.prefixes || "./";
    const defaultPattern = `[^${escapeString(options.delimiter || "/#?")}]+?`;
    const result = [];
    let key = 0, i = 0, path = "";

    const tryConsume = type => i < tokens.length && tokens[i].type === type ? tokens[i++].value : undefined;
    const mustConsume = type => {
        const value = tryConsume(type);
        if (value !== undefined) return value;
        const { type: nextType, index } = tokens[i];
        throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`);
    };

    const consumeText = () => {
        let result = "", value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };

    while (i < tokens.length) {
        const char = tryConsume("CHAR"), name = tryConsume("NAME"), pattern = tryConsume("PATTERN");
        if (name || pattern) {
            let prefix = char || "";
            if (!prefixes.includes(prefix)) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || ""
            });
            continue;
        }
        const value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        const open = tryConsume("OPEN");
        if (open) {
            const prefix = consumeText();
            const name = tryConsume("NAME") || "";
            const pattern = tryConsume("PATTERN") || "";
            const suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name || (pattern ? key++ : ""),
                pattern: name && !pattern ? defaultPattern : pattern,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || ""
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}

exports.parse = parse;

function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}

exports.compile = compile;

function tokensToFunction(tokens, options = {}) {
    const reFlags = flags(options);
    const encode = options.encode || ((x) => x);
    const validate = options.validate !== false;
    const matches = tokens.map(token => typeof token === "object" ? new RegExp(`^(?:${token.pattern})$`, reFlags) : undefined);
    
    return function (data) {
        let path = "";
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (typeof token === "string") {
                path += token;
                continue;
            }

            const value = data ? data[token.name] : undefined;
            const optional = token.modifier === '?' || token.modifier === '*';
            const repeat = token.modifier === '*' || token.modifier === '+';

            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError(`Expected "${token.name}" to not repeat, but got an array`);
                }
                if (value.length === 0) {
                    if (optional) continue;
                    throw new TypeError(`Expected "${token.name}" to not be empty`);
                }
                for (let j = 0; j < value.length; j++) {
                    const segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError(`Expected all "${token.name}" to match "${token.pattern}", but got "${segment}"`);
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }

            if (typeof value === 'string' || typeof value === 'number') {
                const segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError(`Expected "${token.name}" to match "${token.pattern}", but got "${segment}"`);
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }

            if (optional) continue;
            const typeOfMessage = repeat ? "an array" : "a string";
            throw new TypeError(`Expected "${token.name}" to be ${typeOfMessage}`);
        }
        return path;
    };
}

exports.tokensToFunction = tokensToFunction;

function match(str, options) {
    const keys = [];
    const re = pathToRegexp(str, keys, options);
    return regexpToFunction(re, keys, options);
}

exports.match = match;

function regexpToFunction(re, keys, options = {}) {
    const decode = options.decode || ((x) => x);
    return function (pathname) {
        const m = re.exec(pathname);
        if (!m) return false;
        const { 0: path, index } = m;
        const params = {};
        for (let i = 1; i < m.length; i++) {
            if (m[i] === undefined) continue;
            const key = keys[i - 1];
            if (key.modifier === "*" || key.modifier === "+") {
                params[key.name] = m[i].split(key.prefix + key.suffix).map(value => decode(value, key));
            } else {
                params[key.name] = decode(m[i], key);
            }
        }
        return { path, index, params };
    };
}

exports.regexpToFunction = regexpToFunction;

function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}

function flags(options) {
    return options && options.sensitive ? "" : "i";
}

function regexpToRegexp(path, keys) {
    if (!keys) return path;
    const pattern = /\((?:\?<(.*?)>)?(?!\?)/g;
    let match, index = 0;

    while (match = pattern.exec(path.source)) {
        keys.push({
            name: match[1] || index++,
            prefix: "",
            suffix: "",
            modifier: "",
            pattern: ""
        });
    }
    return path;
}

function arrayToRegexp(paths, keys, options) {
    const parts = paths.map(path => pathToRegexp(path, keys, options).source);
    return new RegExp(`(?:${parts.join("|")})`, flags(options));
}

function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
}

function tokensToRegexp(tokens, keys, options = {}) {
    const strict = options.strict || false;
    const start = options.start !== false;
    const end = options.end !== false;
    const encode = options.encode || ((x) => x);
    const endsWith = `[${escapeString(options.endsWith || "")}]|$`;
    const delimiter = `[${escapeString(options.delimiter || "/#?")}]`;
    let route = start ? "^" : "";

    for (const token of tokens) {
        if (typeof token === "string") {
            route += escapeString(encode(token));
        } else {
            const prefix = escapeString(encode(token.prefix));
            const suffix = escapeString(encode(token.suffix));
            if (token.pattern) {
                if (keys) keys.push(token);
                if (prefix || suffix) {
                    if (token.modifier === "+" || token.modifier === "*") {
                        const mod = token.modifier === "*" ? "?" : "";
                        route += `(?:${prefix}((?:${token.pattern})(?:${suffix}${prefix}(?:${token.pattern}))*)${suffix})${mod}`;
                    } else {
                        route += `(?:${prefix}(${token.pattern})${suffix})${token.modifier}`;
                    }
                } else {
                    route += `(${token.pattern})${token.modifier}`;
                }
            } else {
                route += `(?:${prefix}${suffix})${token.modifier}`;
            }
        }
    }

    if (end) {
        if (!strict) route += `${delimiter}?`;
        route += options.endsWith ? `(?=${endsWith})` : "$";
    } else {
        const endToken = tokens[tokens.length - 1];
        const isEndDelimited = typeof endToken === "string"
            ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
            : endToken === undefined;
        if (!strict) {
            route += `(?:${delimiter}(?=${endsWith}))?`;
        }
        if (!isEndDelimited) {
            route += `(?=${delimiter}|${endsWith})`;
        }
    }
    return new RegExp(route, flags(options));
}

exports.tokensToRegexp = tokensToRegexp;

function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp) return regexpToRegexp(path, keys);
    if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
}

exports.pathToRegexp = pathToRegexp;
