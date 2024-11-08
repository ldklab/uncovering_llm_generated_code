// quote.js
function quote(args) {
    return args.map(arg => {
        if (/[\s'"\$`]/.test(arg)) {
            return `'${arg.replace(/'/g, "'\\''")}'`;
        }
        return arg;
    }).join(' ');
}

module.exports = quote;

// parse.js
function parse(cmd, env = {}, opts = { escape: '\\' }) {
    const result = [];
    const tokenPattern = /'[^']*'|"[^"]*"|\S+/g;
    let match;

    while ((match = tokenPattern.exec(cmd)) !== null) {
        let token = match[0];
        if (token.startsWith('"') || token.startsWith("'")) {
            token = token.slice(1, -1);
        }
        token = token.replace(new RegExp(`\\${opts.escape}`, 'g'), '');

        if (token.includes('=')) {
            let [key, value] = token.split('=');
            if (value.startsWith("$") && env.hasOwnProperty(value.slice(1))) {
                value = env[value.slice(1)];
            }
            result.push(`${key}=${value}`);
        } else if (token.startsWith("$") && env.hasOwnProperty(token.slice(1))) {
            result.push(env[token.slice(1)]);
        } else {
            result.push(token);
        }
    }

    return result;
}

module.exports = parse;

// index.js
const quote = require('./quote');
const parse = require('./parse');

module.exports = { quote, parse };
