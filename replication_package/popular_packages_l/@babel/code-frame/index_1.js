// code-frame/index.js

function generateCodeFrame(source, line, column, options = {}) {
    const lines = source.split('\n');
    const frameSize = options.frameSize || 2;
    const start = Math.max(line - frameSize, 0);
    const end = Math.min(line + frameSize, lines.length);

    let frame = '';
    for (let i = start; i < end; i++) {
        const lineNumber = (i + 1).toString().padStart(4, ' ');
        const indicator = (i === line - 1) ? ' > ' : '   ';
        frame += `${indicator}${lineNumber} | ${lines[i]}\n`;

        if (i === line - 1) {
            const pad = ''.padStart(column + lineNumber.length + 5, ' ');
            frame += `${pad}^\n`;
        }
    }
    return frame;
}

function codeFrameErrors(source, line, column, message, options) {
    const codeFrame = generateCodeFrame(source, line, column, options);
    return `${message}\n\n${codeFrame}`;
}

module.exports = {
    generateCodeFrame,
    codeFrameErrors,
};

// Example Usage
if (require.main === module) {
    const sourceCode = `
function add(a, b) {
    return a + b;
}

console.log(add(2, 3));
`;

    console.log(codeFrameErrors(sourceCode, 3, 12, 'Unexpected token'));
}
