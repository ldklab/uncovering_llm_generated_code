// json5.js

// A class for parsing and stringifying JSON5 format, which allows JSON-like syntax with some added features
class JSON5 {
    static parse(text, reviver) {
        // Removes comments and whitespace from the input text
        let commentsAndWhiteSpaceRemoved = text.replace(/\/\/.*|\/\*[\s\S]*?\*\/|[\n\r\t]/g, '');

        // Manipulates text to create a valid JSON string
        let json = commentsAndWhiteSpaceRemoved
                      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensures property names are quoted
                      .replace(/(['"])?(Infinity|NaN)(['"])?/g, (_, quote, value) => {
                          if (quote) return quote + value + quote; // Retains quotes if present
                          // Replaces Infinity and NaN with proper representations
                          return (value === "Infinity") ? "1.0/0" : "0/0"; 
                      });
        // Parses the processed JSON string and applies a reviver function if provided
        return reviver ? JSON.parse(json, reviver) : JSON.parse(json);
    }

    static stringify(value, replacer, space) {
        // Converts a JavaScript object into a JSON string
        let json = JSON.stringify(value, replacer, space);

        if (space !== undefined) {
            return json.replace(/\n/g, '\n') // Ensures multi-line format if space is defined
                       .replace(/"([^"]+)":/g, '$1:') // Quotes around keys are removed
                       .replace(/,\n(\s*[\]}])/g, '\n$1'); // Trailing commas are removed
        }

        // Returns the JSON string unmodified if no space is provided
        return json;
    }
}

// Expose JSON5 functionalities as a module
module.exports = JSON5;

// Registers a .json5 file support for require() function
require.extensions['.json5'] = function(module, filename) {
    const fs = require('fs');
    // Reads and parses the content of the .json5 file
    const content = fs.readFileSync(filename, 'utf8');
    module.exports = JSON5.parse(content);
};

// Execution block for usage as a command-line tool
if (require.main === module) {
    const fs = require('fs');
    const file = process.argv[2]; // The file to process is expected as the second argument
    const space = process.argv.includes('--space') ? '  ' : undefined; // Optional space formatting
    if (!file) {
        console.error("Please provide a file to process."); // Error prompting when file is not specified
        process.exit(1);
    }
    // Reads the file contents, parses it and outputs the stringified JSON5
    const text = fs.readFileSync(file, 'utf8');
    const parsed = JSON5.parse(text);
    console.log(JSON5.stringify(parsed, null, space));
}
