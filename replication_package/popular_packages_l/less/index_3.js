const less = require('less');
const fs = require('fs');
const path = require('path');

class LessCompiler {
    compileFromFile(inputFilePath, options = {}) {
        const fullPath = path.resolve(inputFilePath);
        const outputFilePath = fullPath.replace(/\.less$/, '.css');

        fs.promises.readFile(fullPath, 'utf8')
            .then(data => this.less.render(data, options))
            .then(output => fs.promises.writeFile(outputFilePath, output.css, 'utf8'))
            .then(() => console.log(`Successfully compiled ${inputFilePath} to ${outputFilePath}`))
            .catch(err => console.error(`Error handling file: ${err.message}`, err));
    }
}

// Usage Example
(async () => {
    const lessCompiler = new LessCompiler();
    await lessCompiler.compileFromFile('path/to/style.less');
})();
