// json5.js

class JSON5 {
    static parse(text, reviver) {
        // Remove comments and whitespace characters (newline, return, and tab)
        let sanitizedText = text.replace(/\/\/.*|\/\*[\s\S]*?\*\/|[\n\r\t]/g, '');

        // Convert unquoted keys to quoted keys in the resultant JSON string
        // Convert Infinity and NaN to standard JSON-compatible expressions
        let json = sanitizedText
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
            .replace(/(['"])?(Infinity|NaN)(['"])?/g, (_, quote, value) => {
                if (quote) return quote + value + quote; 
                return (value === "Infinity") ? "1.0/0" : "0/0";
            });

        // Parse JSON and apply any reviver function
        return reviver ? JSON.parse(json, reviver) : JSON.parse(json);
    }

    static stringify(value, replacer, space) {
        // Perform JSON.stringify with possible transformations
        let json = JSON.stringify(value, replacer, space);

        if (space !== undefined) {
            // Retain multiline and enhance readability by modifying key quotes and removing trailing commas
            return json.replace(/\n/g, '\n') 
                       .replace(/"([^"]+)":/g, '$1:') 
                       .replace(/,\n(\s*[\]}])/g, '\n$1');
        }

        return json;
    }
}

// Expose as a module
module.exports = JSON5;

// Allow .json5 files to be automatically parsed when required
require.extensions['.json5'] = function(module, filename) {
    const fs = require('fs');
    const content = fs.readFileSync(filename, 'utf8');
    module.exports = JSON5.parse(content);
};

// Command-Line Interface (CLI) Tool
if (require.main === module) {
    const fs = require('fs');
    const filepath = process.argv[2];
    const formattedSpace = process.argv.includes('--space') ? '  ' : undefined;

    // Handle cases where no file is provided via CLI
    if (!filepath) {
        console.error("Please provide a file to process.");
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filepath, 'utf8');
    const parsedContent = JSON5.parse(fileContent);
    console.log(JSON5.stringify(parsedContent, null, formattedSpace));
}
