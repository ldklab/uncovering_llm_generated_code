const fs = require('fs');

class JSONParseError extends SyntaxError {
    constructor(er, text, context = 20) {
        super(er.message);
        this.name = 'JSONParseError';
        const errorPosition = parseInt(er.message.match(/at position (\d+)/)[1]);
        const start = Math.max(0, errorPosition - context);
        const end = Math.min(text.length, errorPosition + context);
        this.context = text.slice(start, end);
        this.position = errorPosition;
        this.message = er.message.replace(/at position \d+/, `at position ${errorPosition}\nContext: ...${this.context}...`);
    }
}

function stripBOM(content) {
    return content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
}

function determineIndentation(chunks) {
    const leadingSpaceMatch = chunks.match(/^[ \t]*(?=\S|$)/);
    return leadingSpaceMatch ? leadingSpaceMatch[0] : '';
}

function determineNewline(chunks) {
    if (chunks.includes('\r\n')) return '\r\n';
    if (chunks.includes('\n')) return '\n';
    return chunks.includes('\r') ? '\r' : '\n';
}

function parseJson(txt, reviver = null, context = 20) {
    txt = stripBOM(txt);

    try {
        const result = JSON.parse(txt, reviver);
        Object.defineProperty(result, Symbol.for('indent'), {
            value: determineIndentation(txt),
            enumerable: false,
        });

        Object.defineProperty(result, Symbol.for('newline'), {
            value: determineNewline(txt),
            enumerable: false,
        });

        return result;
    } catch (er) {
        throw new JSONParseError(er, txt, context);
    }
}

parseJson.noExceptions = function(txt, reviver = null) {
    try {
        return parseJson(txt, reviver);
    } catch {
        return undefined;
    }
};

const parseJsonEvenBetterErrors = module.exports = parseJson;

// Example Use Case
(async () => {
    try {
        // Parsing valid JSON
        const jsonString = '{"key": "value"}';
        const parsedData = parseJsonEvenBetterErrors(jsonString);
        console.log(parsedData); // { key: 'value' }
        console.log(parsedData[Symbol.for('indent')]); // ''
        console.log(parsedData[Symbol.for('newline')]); // '\n'

        // Parsing malformed JSON
        console.log(parseJsonEvenBetterErrors.noExceptions('{key: value}')); // undefined

        // File IO integration
        const filename = './example.json';
        const content = await fs.promises.readFile(filename, 'utf8');
        const data = parseJsonEvenBetterErrors(content);

        // Modify data
        data.newKey = 'newValue';

        // Save back with formatting
        const indent = data[Symbol.for('indent')];
        const newline = data[Symbol.for('newline')];
        const jsonString = JSON.stringify(data, null, indent) + newline;
        const eolFixedString = newline === '\n' ? jsonString : jsonString.replace(/\n/g, newline);

        await fs.promises.writeFile(filename, eolFixedString);
    } catch (error) {
        console.error(error);
    }
})();