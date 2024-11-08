const less = require('less');
const fs = require('fs').promises;
const path = require('path');

class LessCompiler {
    constructor(lessLib) {
        this.less = lessLib;
    }

    async compileFromFile(inputFilePath, options = {}) {
        const fullPath = path.resolve(inputFilePath);
        const outputFilePath = fullPath.replace(/\.less$/, '.css');

        try {
            const data = await fs.readFile(fullPath, 'utf8');
            const output = await this.less.render(data, options);
            await fs.writeFile(outputFilePath, output.css, 'utf8');
            console.log(`Successfully compiled ${inputFilePath} to ${outputFilePath}`);
        } catch (error) {
            console.error(`Error processing the file: ${inputFilePath}`, error);
        }
    }
}

// Usage Example
const lessCompiler = new LessCompiler(less);
lessCompiler.compileFromFile('path/to/style.less');
