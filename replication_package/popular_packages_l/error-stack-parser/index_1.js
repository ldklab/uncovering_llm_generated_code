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
            // Try to match first standard stack trace pattern, then fallback to a simpler one if needed.
            const matchedData = line.match(/\s*at\s+(\S+)\s+\(([^)]+):(\d+):(\d+)\)/) || line.match(/\s*at\s+(.*):(\d+):(\d+)/);
            
            if (!matchedData) return null;

            const [, functionName = 'unknown', fileName, lineNumber, columnNumber] = matchedData;

            return new StackFrame({
                functionName,
                fileName,
                lineNumber: parseInt(lineNumber, 10),
                columnNumber: parseInt(columnNumber, 10),
                isNative: line.includes('[native code]'),
                isEval: line.includes('eval'),
            });
        }).filter(frame => frame);
    }
}

module.exports = { StackFrame, ErrorStackParser };
