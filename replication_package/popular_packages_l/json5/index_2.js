// customJSON5.js

class CustomJSON5 {
    // Parse JSON5 to JSON
    static parse(text, reviver) {
        // Remove comments and white space
        let cleanedText = text.replace(/\/\/.*|\/\*[\s\S]*?\*\/|[\n\r\t]/g, '');
        
        // Convert non-standard JSON5 to standard JSON
        let standardJson = cleanedText
                              .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
                              .replace(/(['"])?(Infinity|NaN)(['"])?/g, (_, quote, value) => {
                                  if (quote) return quote + value + quote;
                                  return (value === "Infinity") ? "1.0/0" : "0/0";
                              });
        
        // Use JSON.parse with an optional reviver function
        return reviver ? JSON.parse(standardJson, reviver) : JSON.parse(standardJson);
    }

    // Convert JSON to JSON5 format
    static stringify(value, replacer, space) {
        let jsonRepresentation = JSON.stringify(value, replacer, space);
        
        if (space !== undefined) {
            return jsonRepresentation
                .replace(/"([^"]+)":/g, '$1:') // Remove quotes around keys
                .replace(/,\n(\s*[\]}])/g, '\n$1'); // Remove trailing commas
        }
        
        return jsonRepresentation;
    }
}

// Export as a module
module.exports = CustomJSON5;

// Extension for requiring .json5 files
require.extensions['.json5'] = function(module, filename) {
    const fs = require('fs');
    const fileContent = fs.readFileSync(filename, 'utf8');
    module.exports = CustomJSON5.parse(fileContent);
};

// Command Line Interface (CLI) execution
if (require.main === module) {
    const fs = require('fs');
    const filePath = process.argv[2];
    const useSpace = process.argv.includes('--space') ? '  ' : undefined;

    if (!filePath) {
        console.error("Please provide a file to process.");
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedContent = CustomJSON5.parse(fileContent);
    console.log(CustomJSON5.stringify(parsedContent, null, useSpace));
}
