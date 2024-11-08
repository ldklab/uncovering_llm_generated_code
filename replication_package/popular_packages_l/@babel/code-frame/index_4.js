// code-frame/index.js
function generateCodeFrame(source, line, column, options = {}) {
    const lines = source.split('\n');
    const totalLines = lines.length;
    const frameSize = options.frameSize || 2;
    const startLine = Math.max(line - frameSize, 0);
    const endLine = Math.min(line + frameSize, totalLines);
    let frameOutput = '';

    for (let currentLine = startLine; currentLine < endLine; currentLine++) {
        const lineNumber = (currentLine + 1).toString().padStart(4, ' ');
        const isTargetLine = currentLine === line - 1;
        const prefix = isTargetLine ? ' > ' : '   ';
        frameOutput += `${prefix}${lineNumber} | ${lines[currentLine]}\n`;

        if (isTargetLine) {
            const markerPadding = ''.padStart(column + lineNumber.length + 5, ' ');
            frameOutput += `${markerPadding}^\n`;
        }
    }
    return frameOutput;
}

function codeFrameErrors(source, line, column, message, options) {
    const frame = generateCodeFrame(source, line, column, options);
    return `${message}\n\n${frame}`;
}

module.exports = {
    generateCodeFrame,
    codeFrameErrors,
};

// Example Usage
if (require.main === module) {
    const sampleCode = `
function add(a, b) {
    return a + b;
}

console.log(add(2, 3));
`;

    console.log(codeFrameErrors(sampleCode, 3, 12, 'Unexpected token'));
}
