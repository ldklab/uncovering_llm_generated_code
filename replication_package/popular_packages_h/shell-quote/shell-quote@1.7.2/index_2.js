// Quoting utility

function quote(xs) {
    return xs.map(s => {
        if (s && typeof s === 'object') {
            return s.op.replace(/(.)/g, '\\$1');
        } else if (/["\s]/.test(s) && !/'/.test(s)) {
            return "'" + s.replace(/(['\\])/g, '\\$1') + "'";
        } else if (/["'\s]/.test(s)) {
            return '"' + s.replace(/(["\\$`!])/g, '\\$1') + '"';
        } else {
            return String(s).replace(/([A-z]:)?([#!"$&'()*,:;<=>?@\[\\\]^`{|}])/g, '$1\\$2');
        }
    }).join(' ');
}

// Parser utility

const CONTROL = '(?:' + [
    '\\|\\|', '\\&\\&', ';;', '\\|\\&', '\\<\\(', '>>', '>\\&', '[&;()|<>]'
].join('|') + ')';
const META = '|&;()<> \\t';
const BAREWORD = '(\\\\[\'"' + META + ']|[^\\s\'"' + META + '])+';
const SINGLE_QUOTE = '"((\\\\"|[^"])*?)"';
const DOUBLE_QUOTE = '\'((\\\\\'|[^\'])*?)\'';

let TOKEN = '';
for (let i = 0; i < 4; i++) {
    TOKEN += (Math.pow(16, 8) * Math.random()).toString(16);
}

function parse(s, env, opts) {
    const mapped = parseInternal(s, env, opts);
    if (typeof env !== 'function') return mapped;
    return mapped.reduce((acc, s) => {
        if (typeof s === 'object') return acc.concat(s);
        const xs = s.split(new RegExp('(' + TOKEN + '.*?' + TOKEN + ')', 'g'));
        if (xs.length === 1) return acc.concat(xs[0]);
        return acc.concat(xs.filter(Boolean).map(x => {
            if (new RegExp('^' + TOKEN).test(x)) {
                return JSON.parse(x.split(TOKEN)[1]);
            } else return x;
        }));
    }, []);
}

function parseInternal(s, env, opts) {
    const chunker = new RegExp([
        '(' + CONTROL + ')',
        '(' + BAREWORD + '|' + SINGLE_QUOTE + '|' + DOUBLE_QUOTE + ')*'
    ].join('|'), 'g');
    const match = s.match(chunker).filter(Boolean);
    let commented = false;

    if (!match) return [];
    if (!env) env = {};
    if (!opts) opts = {};

    return match.map((s, j) => {
        if (commented) return;
        if (new RegExp('^' + CONTROL + '$').test(s)) {
            return { op: s };
        }

        const SQ = "'";
        const DQ = '"';
        const DS = '$';
        const BS = opts.escape || '\\';
        let quote = false;
        let esc = false;
        let out = '';
        let isGlob = false;

        for (let i = 0, len = s.length; i < len; i++) {
            const c = s.charAt(i);
            isGlob = isGlob || (!quote && (c === '*' || c === '?'));
            if (esc) {
                out += c;
                esc = false;
            } else if (quote) {
                if (c === quote) {
                    quote = false;
                } else if (quote == SQ) {
                    out += c;
                } else { // Double quote
                    if (c === BS) {
                        i += 1;
                        c = s.charAt(i);
                        if (c === DQ || c === BS || c === DS) {
                            out += c;
                        } else {
                            out += BS + c;
                        }
                    } else if (c === DS) {
                        out += parseEnvVar();
                    } else {
                        out += c;
                    }
                }
            } else if (c === DQ || c === SQ) {
                quote = c;
            } else if (new RegExp('^' + CONTROL + '$').test(c)) {
                return { op: s };
            } else if (new RegExp('^#$').test(c)) {
                commented = true;
                if (out.length){
                    return [out, { comment: s.slice(i + 1) + match.slice(j + 1).join(' ') }];
                }
                return [{ comment: s.slice(i + 1) + match.slice(j + 1).join(' ') }];
            } else if (c === BS) {
                esc = true;
            } else if (c === DS) {
                out += parseEnvVar();
            } else out += c;
        }

        if (isGlob) return { op: 'glob', pattern: out };

        return out;

        function parseEnvVar() {
            i += 1;
            let varend, varname;
            if (s.charAt(i) === '{') {
                i += 1;
                if (s.charAt(i) === '}') {
                    throw new Error("Bad substitution: " + s.substr(i - 2, 3));
                }
                varend = s.indexOf('}', i);
                if (varend < 0) {
                    throw new Error("Bad substitution: " + s.substr(i));
                }
                varname = s.substr(i, varend - i);
                i = varend;
            } else if (/[*@#?$!_\-]/.test(s.charAt(i))) {
                varname = s.charAt(i);
                i += 1;
            } else {
                varend = s.substr(i).match(/[^\w\d_]/);
                if (!varend) {
                    varname = s.substr(i);
                    i = s.length;
                } else {
                    varname = s.substr(i, varend.index);
                    i += varend.index - 1;
                }
            }
            return getVar(null, '', varname);
        }
    })
    .reduce((prev, arg) => {
        if (arg === undefined) {
            return prev;
        }
        return prev.concat(arg);
    }, []);

    function getVar(_, pre, key) {
        let r = typeof env === 'function' ? env(key) : env[key];
        if (r === undefined && key !== '')
            r = '';
        else if (r === undefined)
            r = '$';

        if (typeof r === 'object') {
            return pre + TOKEN + JSON.stringify(r) + TOKEN;
        } else return pre + r;
    }
}

exports.quote = quote;
exports.parse = parse;
