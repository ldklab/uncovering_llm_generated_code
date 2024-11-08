const fs = require('fs');

class JSONParseError extends SyntaxError {
    constructor(error, text, context = 20) {
        super(error.message);
        this.name = 'JSONParseError';
        const errorPositionMatch = error.message.match(/at position (\d+)/);
        if (errorPositionMatch) {
            const errorPosition = parseInt(errorPositionMatch[1]);
            const start = Math.max(0, errorPosition - context);
            const end = Math.min(text.length, errorPosition + context);
            this.context = text.slice(start, end);
            this.position = errorPosition;
            this.message = error.message.replace(/at position \d+/, `at position ${errorPosition}\nContext: ...${this.context}...`);
        }
    }
}

function stripBOM(content) {
    return content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
}

function determineIndentation(text) {
    const match = text.match(/^[ \t]*(?=\S|$)/);
    return match ? match[0] : '';
}

function determineNewline(text) {
    if (text.includes('\r\n')) return '\r\n';
    if (text.includes('\n')) return '\n';
    return text.includes('\r') ? '\r' : '\n';
}

function parseJson(text, reviver = null, context = 20) {
    text = stripBOM(text);

    try {
        const parsed = JSON.parse(text, reviver);
        Object.defineProperty(parsed, Symbol.for('indent'), {
            value: determineIndentation(text),
            enumerable: false,
        });
        Object.defineProperty(parsed, Symbol.for('newline'), {
            value: determineNewline(text),
            enumerable: false,
        });
        return parsed;
    } catch (error) {
        throw new JSONParseError(error, text, context);
    }
}

parseJson.noExceptions = function(text, reviver = null) {
    try {
        return parseJson(text, reviver);
    } catch {
        return undefined;
    }
};

const parseJsonEvenBetterErrors = module.exports = parseJson;

// Example Use Case
(async () => {
    try {
        const jsonString = '{"key": "value"}';
        const parsedData = parseJsonEvenBetterErrors(jsonString);
        console.log(parsedData); // { key: 'value' }
        console.log(parsedData[Symbol.for('indent')]); // ''
        console.log(parsedData[Symbol.for('newline')]); // '\n'

        console.log(parseJsonEvenBetterErrors.noExceptions('{key: value}')); // undefined

        const filename = './example.json';
        const content = await fs.promises.readFile(filename, 'utf8');
        const data = parseJsonEvenBetterErrors(content);

        data.newKey = 'newValue';

        const indent = data[Symbol.for('indent')];
        const newline = data[Symbol.for('newline')];
        const jsonStringWrite = JSON.stringify(data, null, indent) + newline;
        const eolFixedString = newline === '\n' ? jsonStringWrite : jsonStringWrite.replace(/\n/g, newline);

        await fs.promises.writeFile(filename, eolFixedString);
    } catch (error) {
        console.error(error);
    }
})();
