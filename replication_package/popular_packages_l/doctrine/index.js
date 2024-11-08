/**
 * Doctrine JSDoc comment parser implemented in JavaScript.
 */
module.exports = {
    parse: function (comment, options = {}) {
        // Default options
        const defaultOptions = {
            unwrap: false,
            tags: null,
            recoverable: false,
            sloppy: false,
            lineNumbers: false,
            range: false
        };

        // Merge user-provided options with defaults
        options = { ...defaultOptions, ...options };

        // Unwrap the comment if required
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
                const tagParts = line.substr(1).split(' ');
                const tag = {
                    title: tagParts.shift(),
                    description: tagParts.join(' '),
                    type: null,
                    name: ''
                };

                // Basic handling for @param based on JSDoc syntax
                if (tag.title === 'param') {
                    const match = /\{([^}]+)\}\s+(\S+)\s+([\s\S]*)/.exec(tag.description);
                    if (match) {
                        tag.type = this.parseType(match[1]);
                        tag.name = match[2];
                        tag.description = match[3];
                    }
                }

                // Apply `tags` filter if provided
                if (!options.tags || options.tags.includes(tag.title)) {
                    ast.tags.push(tag);
                }
            }

            // Add line numbers if required
            if (options.lineNumbers) {
                ast.lineNumber = index + 1;
            }

            // Add range if required
            if (options.range) {
                ast.range = [0, comment.length]; // Simplified range
            }
        });

        return ast;
    },

    parseType: function (typeString) {
        // Minimal type parsing logic
        if (typeString.startsWith('{')) {
            return {
                type: 'RecordType',
                fields: typeString.replace(/[{}]/g, '').split(',').map(field => {
                    const [key, type] = field.split(':');
                    return {
                        type: 'FieldType',
                        key: key.trim(),
                        value: { type: 'NameExpression', name: type.trim() }
                    };
                })
            };
        } else {
            return { type: 'NameExpression', name: typeString };
        }
    }
};

// Example usage:
const doctrine = require('./Doctrine');

const jsdocComment = `
/**
 * This function comment is parsed by doctrine
 * @param {{ok:String}} userName
 */
`;

console.log(doctrine.parse(jsdocComment, { unwrap: true }));
