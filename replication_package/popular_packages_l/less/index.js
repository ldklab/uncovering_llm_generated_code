const less = require('less');
const fs = require('fs');
const path = require('path');

class LessCompiler {
    constructor() {
        this.less = less;
    }

    compileFromFile(inputFilePath, options = {}) {
        const fullPath = path.resolve(inputFilePath);
        const outputFilePath = fullPath.replace(/\.less$/, '.css');

        fs.readFile(fullPath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading the file: ${fullPath}`, err);
                return;
            }

            this.less.render(data, options)
                .then(output => {
                    fs.writeFile(outputFilePath, output.css, 'utf8', err => {
                        if (err) {
                            console.error(`Error writing CSS to file: ${outputFilePath}`, err);
                            return;
                        }
                        console.log(`Successfully compiled ${inputFilePath} to ${outputFilePath}`);
                    });
                })
                .catch(err => {
                    console.error(`Error compiling LESS: ${inputFilePath}`, err);
                });
        });
    }
}

// Usage Example
const lessCompiler = new LessCompiler();
lessCompiler.compileFromFile('path/to/style.less');
