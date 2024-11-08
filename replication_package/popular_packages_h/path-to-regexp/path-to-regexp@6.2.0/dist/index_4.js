"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathToRegexp = exports.tokensToRegexp = exports.regexpToFunction = exports.match = exports.tokensToFunction = exports.compile = exports.parse = void 0;

function lexer(str) {
    let tokens = [];
    let i = 0;
    
    while (i < str.length) {
        let char = str[i];
        
        switch (char) {
            case "*":
            case "+":
            case "?":
                tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
                break;
            case "\\":
                tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
                break;
            case "{":
                tokens.push({ type: "OPEN", index: i, value: str[i++] });
                break;
            case "}":
                tokens.push({ type: "CLOSE", index: i, value: str[i++] });
                break;
            case ":":
                let name = "";
                let j = i + 1;
                while (j < str.length) {
                    const code = str.charCodeAt(j);
                    if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95) {
                        name += str[j++];
                    } else {
                        break;
                    }
                }
                if (!name) throw new TypeError("Missing parameter name at " + i);
                tokens.push({ type: "NAME", index: i, value: name });
                i = j;
                break;
            case "(":
                let count = 1;
                let pattern = "";
                let k = i + 1;
                if (str[k] === "?") throw new TypeError("Pattern cannot start with \"?\" at " + k);

                while (k < str.length) {
                    if (str[k] === "\\") {
                        pattern += str[k++] + str[k++];
                    } else if (str[k] === ")") {
                        count--;
                        if (count === 0) {
                            k++;
                            break;
                        }
                    } else if (str[k] === "(") {
                        count++;
                        if (str[k + 1] !== "?") throw new TypeError("Capturing groups are not allowed at " + k);
                    } else {
                        pattern += str[k++];
                    }
                }
                if (count) throw new TypeError("Unbalanced pattern at " + i);
                if (!pattern) throw new TypeError("Missing pattern at " + i);
                tokens.push({ type: "PATTERN", index: i, value: pattern });
                i = k;
                break;
            default:
                tokens.push({ type: "CHAR", index: i, value: str[i++] });
                break;
        }
    }

    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}

function parse(str, options = {}) {
    const tokens = lexer(str);
    const { prefixes = "./", delimiter = "/#?" } = options;
    const defaultPattern = `[^${escapeString(delimiter)}]+?`;
    let result = [];
    let key = 0;
    let i = 0;
    let path = "";

    while (i < tokens.length) {
        const char = tryConsume("CHAR");
        const name = tryConsume("NAME");
        const pattern = tryConsume("PATTERN");

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
            let prefix = consumeText();
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

    function tryConsume(type) {
        if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    }

    function mustConsume(type) {
        const value = tryConsume(type);
        if (value !== undefined) return value;
        const { type: nextType, index } = tokens[i];
        throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}`);
    }

    function consumeText() {
        let result = "";
        let value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    }
}
exports.parse = parse;

function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
exports.compile = compile;

function tokensToFunction(tokens, options = {}) {
    const reFlags = flags(options);
    const { encode = x => x, validate = true } = options;
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
            const optional = token.modifier === "?" || token.modifier === "*";
            const repeat = token.modifier === "*" || token.modifier === "+";

            if (Array.isArray(value)) {
                if (!repeat) throw new TypeError(`Expected "${token.name}" to not repeat, but got an array`);
                if (!value.length) {
                    if (optional) continue;
                    throw new TypeError(`Expected "${token.name}" to not be empty`);
                }

                for (const segment of value) {
                    const encodedSegment = encode(segment, token);
                    if (validate && !matches[i].test(encodedSegment)) {
                        throw new TypeError(`Expected all "${token.name}" to match "${token.pattern}", but got "${encodedSegment}"`);
                    }
                    path += `${token.prefix}${encodedSegment}${token.suffix}`;
                }
                continue;
            }

            if (typeof value === "string" || typeof value === "number") {
                const encodedSegment = encode(String(value), token);
                if (validate && !matches[i].test(encodedSegment)) {
                    throw new TypeError(`Expected "${token.name}" to match "${token.pattern}", but got "${encodedSegment}"`);
                }
                path += `${token.prefix}${encodedSegment}${token.suffix}`;
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
    const { decode = x => x } = options;
    return function (pathname) {
        const m = re.exec(pathname);
        if (!m) return false;

        const params = Object.create(null);
        for (let i = 1; i < m.length; i++) {
            if (m[i] === undefined) continue;
            const key = keys[i - 1];
            if (key.modifier === "*" || key.modifier === "+") {
                params[key.name] = m[i].split(key.prefix + key.suffix).map(value => decode(value, key));
            } else {
                params[key.name] = decode(m[i], key);
            }
        }

        return { path: m[0], index: m.index, params };
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
    const groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
    let index = 0;
    let execResult = groupsRegex.exec(path.source);
    while (execResult) {
        keys.push({
            name: execResult[1] || index++,
            prefix: "",
            suffix: "",
            modifier: "",
            pattern: ""
        });
        execResult = groupsRegex.exec(path.source);
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
    const { strict = false, start = true, end = true, encode = x => x } = options;
    const endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
    const delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
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
                        route += `(?:${prefix}((?:${token.pattern})(?:${suffix}${prefix}(?:${token.pattern}))*${suffix}))${mod}`;
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
        if (!strict) route += delimiter + "?";
        route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
    } else {
        const endToken = tokens[tokens.length - 1];
        const isEndDelimited = typeof endToken === "string" ? delimiter.includes(endToken[endToken.length - 1]) : endToken === undefined;
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
