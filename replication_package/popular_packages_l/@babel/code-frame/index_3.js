// code-frame/index.js
function generateCodeFrame(source, line, column, options = {}) {
    const lines = source.split('\n');
    const numberOfLines = lines.length;
    const frameSize = options.frameSize || 2; // Default frame size of 2 lines above and below the specified line
    const start = Math.max(line - frameSize, 0); // Prevent index from going negative
    const end = Math.min(line + frameSize, numberOfLines); // Prevent going beyond the number of lines

    let frame = '';
    for (let i = start; i < end; i++) {
        const lineNumber = (i + 1).toString().padStart(4, ' '); // Right-align line numbers
        const indicator = i === line - 1 ? ' > ' : '   '; // Highlight the specified line
        frame += `${indicator}${lineNumber} | ${lines[i]}\n`;

        if (i === line - 1) {
            const pad = ''.padStart(column + lineNumber.length + 5, ' '); // Calculate padding for the caret
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
