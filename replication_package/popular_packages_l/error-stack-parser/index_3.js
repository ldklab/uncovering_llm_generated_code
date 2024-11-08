// error-stack-parser.js

class StackFrame {
    constructor({functionName, fileName, lineNumber, columnNumber, isNative = false, isEval = false, isConstructor = false, args = []}) {
        this.functionName = functionName;
        this.fileName = fileName;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
        this.isNative = isNative;
        this.isEval = isEval;
        this.isConstructor = isConstructor;
        this.args = args;
    }
}

class ErrorStackParser {
    static parse(error) {
        if (!error || !error.stack) {
            throw new Error('Given error must have a stack');
        }

        return error.stack.split('\n').map(line => {
            let matchedData = line.match(/at (\S+) \((.*):(\d+):(\d+)\)/);
            if (!matchedData) {
                matchedData = line.match(/at (.*):(\d+):(\d+)/);
            }

            if (!matchedData) return null;

            const functionName = matchedData[1] || 'unknown';
            const fileName = matchedData[2];
            const lineNumber = parseInt(matchedData[3], 10);
            const columnNumber = parseInt(matchedData[4], 10);

            return new StackFrame({
                functionName,
                fileName,
                lineNumber,
                columnNumber,
                isNative: line.includes('[native code]'),
                isEval: line.includes('eval'),
            });
        }).filter(Boolean);
    }
}

module.exports = { StackFrame, ErrorStackParser };
