// Improved JSON5.js

class JSON5 {
    // Parses a JSON5 string, allowing for comments and unquoted keys, to a JSON object
    static parse(text, reviver) {
        // Remove comments and whitespace
        let cleanedText = text.replace(/\/\/.*|\/\*[\s\S]*?\*\/|[\n\r\t]/g, '');
        
        // Prepare a valid JSON string
        let json = cleanedText
            // Ensure keys are quoted
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
            // Handle special values Infinity and NaN
            .replace(/(['"])?(Infinity|NaN)(['"])?/g, (_, quote, value) => {
                return quote ? `${quote}${value}${quote}` : (value === "Infinity" ? "1.0/0" : "0/0");
            });

        // Parse the JSON string using the optional reviver function
        return reviver ? JSON.parse(json, reviver) : JSON.parse(json);
    }

    // Converts a JavaScript value to a JSON5 string
    static stringify(value, replacer, space) {
        let json = JSON.stringify(value, replacer, space);
        
        // If indentation space is specified, maintain readability
        if (space !== undefined) {
            return json.replace(/"([^"]+)":/g, '$1:')  // Remove quotes around keys
                       .replace(/,\n(\s*[\]}])/g, '\n$1');  // Remove trailing commas
        }
        
        return json;
    }
}

// Export the JSON5 class for use as a module
module.exports = JSON5;

// Register .json5 file extension to be parsed using the JSON5.parse method
require.extensions['.json5'] = (module, filename) => {
    const fs = require('fs');
    const content = fs.readFileSync(filename, 'utf8');
    module.exports = JSON5.parse(content);
};

// Allow CLI execution for converting JSON5 files to JSON with optional formatting
if (require.main === module) {
    const fs = require('fs');
    const file = process.argv[2];
    const space = process.argv.includes('--space') ? '  ' : undefined;
    
    // Ensure a file is provided
    if (!file) {
        console.error("Please provide a file to process.");
        process.exit(1);
    }
    
    // Read, parse, and stringify the JSON5 file
    const text = fs.readFileSync(file, 'utf8');
    const parsed = JSON5.parse(text);
    console.log(JSON5.stringify(parsed, null, space));
}
