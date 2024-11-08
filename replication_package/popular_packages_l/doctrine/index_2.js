/**
 * A simple JSDoc comment parser written in JavaScript.
 */
function parseJSDoc(comment, options = {}) {
    // Setup default options
    const defaultOptions = {
        unwrap: false,
        tags: null,
        recoverable: false,
        sloppy: false,
        lineNumbers: false,
        range: false
    };

    // Merge default options with provided options
    options = { ...defaultOptions, ...options };

    // If `unwrap` is enabled, remove the JSDoc comment delimiters
    if (options.unwrap) {
        comment = comment.replace(/^\/\*\*|\*\/$/g, '').replace(/^\s*\* ?/gm, '');
    }

    const lines = comment.split('\n');
    const ast = { description: '', tags: [] };

    lines.forEach((line, index) => {
        line = line.trim();
        if (!ast.description && !line.startsWith('@')) {
            ast.description = line.trim();
        } else if (line.startsWith('@')) {
            const [title, ...rest] = line.substr(1).split(' ');
            const tag = {
                title: title,
                description: rest.join(' '),
                type: null,
                name: ''
            };

            // Special handling for the @param tag
            if (tag.title === 'param') {
                const match = /\{([^}]+)\}\s+(\S+)\s+([\s\S]*)/.exec(tag.description);
                if (match) {
                    tag.type = parseTypeString(match[1]);
                    tag.name = match[2];
                    tag.description = match[3];
                }
            }

            // Apply filtering based on `tags` option
            if (!options.tags || options.tags.includes(tag.title)) {
                ast.tags.push(tag);
            }
        }

        // Include line numbers if requested
        if (options.lineNumbers) {
            ast.lineNumber = index + 1;
        }

        // Include range in the output if requested
        if (options.range) {
            ast.range = [0, comment.length]; // Simplified range for demo
        }
    });

    return ast;
}

function parseTypeString(typeString) {
    // Basic type string parsing for demonstration
    if (typeString.startsWith('{')) {
        return {
            type: 'RecordType',
            fields: typeString.replace(/[{}]/g, '').split(',').map(field => {
                const [key, valueType] = field.split(':');
                return {
                    type: 'FieldType',
                    key: key.trim(),
                    value: { type: 'NameExpression', name: valueType.trim() }
                };
            })
        };
    } else {
        return { type: 'NameExpression', name: typeString.trim() };
    }
}

// Export the parser functions
module.exports = {
    parse: parseJSDoc,
    parseType: parseTypeString
};

// Example usage
const doctrine = require('./your-module-path');

const exampleComment = `
/**
 * This comment is parsed by a custom parser.
 * @param {{ok:String}} userName
 */
`;

console.log(doctrine.parse(exampleComment, { unwrap: true }));
