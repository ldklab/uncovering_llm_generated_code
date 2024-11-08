const jsDocParser = {
    parse(comment, options = {}) {
        const defaultSettings = {
            unwrap: false,
            tags: null,
            recoverable: false,
            sloppy: false,
            lineNumbers: false,
            range: false
        };

        const config = { ...defaultSettings, ...options };

        if (config.unwrap) {
            comment = comment.replace(/^\/\*\*|\*\/$/g, '').replace(/^\s*\* ?/gm, '');
        }

        const lines = comment.split('\n');
        const result = { description: '', tags: [] };

        lines.forEach((line, idx) => {
            line = line.trim();
            if (!result.description && !line.startsWith('@')) {
                result.description = line;
            } else if (line.startsWith('@')) {
                const tagComponents = line.slice(1).split(' ');
                const tag = {
                    title: tagComponents.shift(),
                    description: tagComponents.join(' '),
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

                if (!config.tags || config.tags.includes(tag.title)) {
                    result.tags.push(tag);
                }
            }

            if (config.lineNumbers) {
                result.lineNumber = idx + 1;
            }

            if (config.range) {
                result.range = [0, comment.length];
            }
        });

        return result;
    },

    parseType(typeString) {
        if (typeString.startsWith('{')) {
            return {
                type: 'RecordType',
                fields: typeString.replace(/[{}]/g, '').split(',').map(field => {
                    const [key, val] = field.split(':');
                    return {
                        type: 'FieldType',
                        key: key.trim(),
                        value: { type: 'NameExpression', name: val.trim() }
                    };
                })
            };
        } else {
            return { type: 'NameExpression', name: typeString };
        }
    }
};

module.exports = jsDocParser;

const docParser = require('./parse_javadoc_comments');

const sampleJsdoc = `
/**
 * Parses the JSDoc comment on a function
 * @param {{username:String}} userName
 */
`;

console.log(docParser.parse(sampleJsdoc, { unwrap: true }));
