// quote.js
function quote(args) {
    return args.map(arg => {
        // Check if argument contains any special character: space, single quote, double quote, dollar, or backtick
        if (/[\s'"\$`]/.test(arg)) {
            // Escape single quotes and wrap in single quotes
            return "'" + arg.replace(/'/g, "'\\''") + "'";
        }
        // Return the argument unmodified if no special character is found
        return arg;
    }).join(' '); // Join the arguments with a space
}

module.exports = quote; // Export the quote function

// parse.js
function parse(cmd, env = {}, opts = { escape: '\\' }) {
    const result = [];
    // Regular expression to match quoted strings or sequences of non-whitespace characters
    const re = /'[^']*'|"[^"]*"|\S+/g;
    let match;

    // Iterate over all matches
    while ((match = re.exec(cmd)) !== null) {
        let part = match[0];
        // Remove outer quotes from quoted parts
        if (part[0] === '"' || part[0] === "'") {
            part = part.slice(1, -1);
        }
        // Remove escape characters
        part = part.replace(new RegExp(`\\${opts.escape}`, 'g'), '');

        // Handle environment variable substitution
        if (part.includes('=')) { 
            let [key, value] = part.split('=');
            // Substitute environment variable if it starts with "$" and exists in the provided environment
            if (value.startsWith("$") && env.hasOwnProperty(value.slice(1))) {
                value = env[value.slice(1)];
            }
            result.push(`${key}=${value}`); // Store the key-value pair
        } else if (part.startsWith("$") && env.hasOwnProperty(part.slice(1))) {
            result.push(env[part.slice(1)]); // Substitute environment variable
        } else {
            result.push(part); // Store part directly if no substitution needed
        }
    }

    return result; // Return the final array of command parts
}

module.exports = parse; // Export the parse function

// index.js
const quote = require('./quote');
const parse = require('./parse');

// Consolidate and export both functionalities
module.exports = { quote, parse };
