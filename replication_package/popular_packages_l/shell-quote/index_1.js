// quote.js
function quote(args) {
    return args.map(arg => {
        if (/[\s'"\$`]/.test(arg)) {
            return "'" + arg.replace(/'/g, "'\\''") + "'";
        }
        return arg;
    }).join(' ');
}

module.exports = quote;

// parse.js
function parse(cmd, env = {}, opts = { escape: '\\' }) {
    const result = [];
    const re = /'[^']*'|"[^"]*"|\S+/g;
    let match;

    while ((match = re.exec(cmd)) !== null) {
        let part = match[0];
        if (part[0] === '"' || part[0] === "'") {
            part = part.slice(1, -1);
        }
        part = part.replace(new RegExp(`\\${opts.escape}`, 'g'), '');

        if (part.includes('=')) {
            let [key, value] = part.split('=');
            if (value.startsWith("$") && env.hasOwnProperty(value.slice(1))) {
                value = env[value.slice(1)];
            }
            result.push(`${key}=${value}`);
        } else if (part.startsWith("$") && env.hasOwnProperty(part.slice(1))) {
            result.push(env[part.slice(1)]);
        } else {
            result.push(part);
        }
    }

    return result;
}

module.exports = parse;

// index.js
const quote = require('./quote');
const parse = require('./parse');

module.exports = { quote, parse };
