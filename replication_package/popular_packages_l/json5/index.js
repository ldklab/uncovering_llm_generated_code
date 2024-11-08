// json5.js

class JSON5 {
    static parse(text, reviver) {
        let commentsAndWhiteSpaceRemoved = text.replace(/\/\/.*|\/\*[\s\S]*?\*\/|[\n\r\t]/g, '');
        let json = commentsAndWhiteSpaceRemoved
                      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
                      .replace(/(['"])?(Infinity|NaN)(['"])?/g, (_, quote, value) => {
                          if (quote) return quote + value + quote; 
                          return (value === "Infinity") ? "1.0/0" : "0/0";
                      });
        return reviver ? JSON.parse(json, reviver) : JSON.parse(json);
    }

    static stringify(value, replacer, space) {
        let json = JSON.stringify(value, replacer, space);
        
        if (space !== undefined) {
            return json.replace(/\n/g, '\n') // Retain multi-line for readability.
                       .replace(/"([^"]+)":/g, '$1:') // Remove quotes around keys.
                       .replace(/,\n(\s*[\]}])/g, '\n$1'); // Remove trailing commas.
        }
        
        return json;
    }
}

// Expose as a module
module.exports = JSON5;

// Node.js `require()` registration (optionally allow require of .json5 files)
require.extensions['.json5'] = function(module, filename) {
    const fs = require('fs');
    const content = fs.readFileSync(filename, 'utf8');
    module.exports = JSON5.parse(content);
};

// CLI Tool Execution
if (require.main === module) {
    const fs = require('fs');
    const file = process.argv[2];
    const space = process.argv.includes('--space') ? '  ' : undefined;
    if (!file) {
        console.error("Please provide a file to process.");
        process.exit(1);
    }
    const text = fs.readFileSync(file, 'utf8');
    const parsed = JSON5.parse(text);
    console.log(JSON5.stringify(parsed, null, space));
}
