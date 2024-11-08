module.exports = {
    parse: function (comment, userOptions = {}) {
        const defaultOptions = {
            unwrap: false,
            tags: null,
            lineNumbers: false,
            range: false
        };
        const options = { ...defaultOptions, ...userOptions };

        if (options.unwrap) {
            comment = comment.replace(/^\/\*\*|\*\/$/g, '').replace(/^\s*\* ?/gm, '');
        }

        const lines = comment.split('\n');
        const ast = { description: '', tags: [] };

        lines.forEach((line, index) => {
            line = line.trim();
            if (!ast.description && !line.startsWith('@')) {
                ast.description = line;
            } else if (line.startsWith('@')) {
                const tagParts = line.substr(1).split(' ');
                const tag = {
                    title: tagParts.shift(),
                    description: tagParts.join(' '),
                    type: null,
                    name: ''
                };

                if (tag.title === 'param') {
                    const match = /\{([^}]+)\}\s+(\S+)\s+([\s\S]*)/.exec(tag.description);
                    if (match) {
                        tag.type = this.parseType(match[1]);
                        tag.name = match[2];
                        tag.description = match[3];
                    }
                }

                if (!options.tags || options.tags.includes(tag.title)) {
                    ast.tags.push(tag);
                }
            }

            if (options.lineNumbers) {
                ast.lineNumber = index + 1;
            }

            if (options.range) {
                ast.range = [0, comment.length];
            }
        });

        return ast;
    },

    parseType: function (typeString) {
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
