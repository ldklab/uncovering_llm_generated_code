// Function to quote an array of input strings appropriately.
exports.quote = (xs) => xs.map(s => {
    if (s && typeof s === 'object') {
        return s.op.replace(/(.)/g, '\\$1');
    }
    else if (/["\s]/.test(s) && !/'/.test(s)) {
        return `'${s.replace(/(['\\])/g, '\\$1')}'`;
    }
    else if (/["'\s]/.test(s)) {
        return `"${s.replace(/(["\\$`!])/g, '\\$1')}"`;
    }
    else {
        return String(s).replace(/([A-z]:)?([#!"$&'()*,:;<=>?@\[\\\]^`{|}])/g, '$1\\$2');
    }
}).join(' ');

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

// Function to parse a command string into shell-like tokens.
exports.parse = (s, env, opts) => {
    const mapped = parse(s, env, opts);
    if (typeof env !== 'function') return mapped;
    return mapped.reduce((acc, s) => {
        if (typeof s === 'object') return acc.concat(s);
        const xs = s.split(RegExp('(' + TOKEN + '.*?' + TOKEN + ')', 'g'));
        if (xs.length === 1) return acc.concat(xs[0]);
        return acc.concat(xs.filter(Boolean).map(x => {
            if (RegExp('^' + TOKEN).test(x)) {
                return JSON.parse(x.split(TOKEN)[1]);
            }
            else return x;
        }));
    }, []);
};

function parse(s, env = {}, opts = {}) {
    const chunker = new RegExp([
        '(' + CONTROL + ')', // control chars
        '(' + BAREWORD + '|' + SINGLE_QUOTE + '|' + DOUBLE_QUOTE + ')*'
    ].join('|'), 'g');
    const match = s.match(chunker)?.filter(Boolean) || [];
    let commented = false;

    return match.map((s, j) => {
        if (commented) return;
        if (RegExp('^' + CONTROL + '$').test(s)) return { op: s };

        let SQ = "'", DQ = '"', DS = '$', BS = opts.escape || '\\';
        let quote = false, esc = false, out = '', isGlob = false;

        for (let i = 0; i < s.length; i++) {
            const c = s.charAt(i);
            isGlob ||= (!quote && (c === '*' || c === '?'));
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
                        c = s.charAt(++i);
                        out += (c === DQ || c === BS || c === DS) ? c : BS + c;
                    } else if (c === DS) {
                        out += parseEnvVar();
                    } else {
                        out += c;
                    }
                }
            } else if (c === DQ || c === SQ) {
                quote = c;
            } else if (RegExp('^' + CONTROL + '$').test(c)) {
                return { op: s };
            } else if (c === '#') {
                commented = true;
                return (out.length)
                    ? [out, { comment: s.slice(i + 1) + match.slice(j + 1).join(' ') }]
                    : [{ comment: s.slice(i + 1) + match.slice(j + 1).join(' ') }];
            } else if (c === BS) {
                esc = true;
            } else if (c === DS) {
                out += parseEnvVar();
            } else out += c;
        }

        if (isGlob) return { op: 'glob', pattern: out };
        return out;

        function parseEnvVar() {
            i++;
            let varend, varname;
            if (s.charAt(i) === '{') {
                if (s.charAt(++i) === '}') throw new Error(`Bad substitution: ${s.substr(i - 2, 3)}`);
                varend = s.indexOf('}', i);
                if (varend < 0) throw new Error(`Bad substitution: ${s.substr(i)}`);
                varname = s.substr(i, varend - i);
                i = varend;
            } else if (/[*@#?$!_\-]/.test(s.charAt(i))) {
                varname = s.charAt(i++);
            } else {
                varend = s.substr(i).match(/[^\w\d_]/);
                varname = varend ? s.substr(i, varend.index) : s.substr(i);
                i += varend ? varend.index - 1 : s.length;
            }
            return getVar('', varname);
        }
    }).reduce((prev, arg) => arg === undefined ? prev : prev.concat(arg), []);

    function getVar(pre, key) {
        let r = typeof env === 'function' ? env(key) : env[key];
        r = (r === undefined && key != '') ? '' : (r === undefined ? '$' : r);
        return (typeof r === 'object') ? pre + TOKEN + JSON.stringify(r) + TOKEN : pre + r;
    }
}
