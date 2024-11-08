const less = require('less');
const fs = require('fs').promises;
const path = require('path');

class LessCompiler {
    constructor() {
        this.less = less;
    }

    async compileFromFile(inputFilePath, options = {}) {
        try {
            const fullPath = path.resolve(inputFilePath);
            const outputFilePath = fullPath.replace(/\.less$/, '.css');
            
            const data = await fs.readFile(fullPath, 'utf8');
            const output = await this.less.render(data, options);
            
            await fs.writeFile(outputFilePath, output.css, 'utf8');
            console.log(`Successfully compiled ${inputFilePath} to ${outputFilePath}`);
        } catch (err) {
            console.error(`Error processing file: ${inputFilePath}`, err);
        }
    }
}

// Usage Example
const lessCompiler = new LessCompiler();
lessCompiler.compileFromFile('path/to/style.less');
