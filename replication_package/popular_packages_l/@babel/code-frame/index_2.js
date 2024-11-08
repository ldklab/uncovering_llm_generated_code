// code-frame/index.js
function generateCodeFrame(source, line, column, options = {}) {
    const lines = source.split('\n');
    const contextLines = options.frameSize || 2;
    const totalLines = lines.length;
    const startLine = Math.max(line - contextLines, 0);
    const endLine = Math.min(line + contextLines, totalLines);

    let frame = '';
    for (let i = startLine; i < endLine; i++) {
        const lineNo = (i + 1).toString().padStart(4, ' ');
        const marker = (i === line - 1) ? ' > ' : '   ';
        frame += `${marker}${lineNo} | ${lines[i]}\n`;

        if (i === line - 1) {
            frame += ''.padStart(column + 6, ' ') + '^\n';
        }
    }
    return frame;
}

function codeFrameErrors(source, line, column, message, options) {
    const frame = generateCodeFrame(source, line, column, options);
    return `${message}\n\n${frame}`;
}

module.exports = {
    generateCodeFrame,
    codeFrameErrors,
};

if (require.main === module) {
    const testSource = `
function add(a, b) {
    return a + b;
}

console.log(add(2, 3));
`;
    console.log(codeFrameErrors(testSource, 3, 12, 'Unexpected token'));
}
