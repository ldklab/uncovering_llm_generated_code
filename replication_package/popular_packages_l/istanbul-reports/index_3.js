const fs = require('fs');
const path = require('path');

class IstanbulReports {
    constructor() {
        this.writer = new Writer();
        this.console = new Console(this.writer);
    }

    node = {
        getRelativeName: (fullPath) => path.relative(process.cwd(), fullPath)
    }

    context = {
        getSource: (filePath) => {
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf-8');
            }
            throw new Error(`File not found: ${filePath}`);
        },

        classForPercent: (type, percent) => {
            return percent === 100 ? 'high' : percent >= 80 ? 'medium' : 'low';
        },

        console: {
            colorize: (str, styleClass) => {
                const styles = {
                    high: '\x1b[32m',
                    medium: '\x1b[33m',
                    low: '\x1b[31m',
                    reset: '\x1b[0m'
                };
                return `${styles[styleClass] || ''}${str}${styles.reset}`;
            },

            write: (str) => this.writer.write(str),

            println: (str) => this.writer.write(`${str}\n`)
        }
    }
}

class Writer {
    constructor() {
        this.output = '';
    }

    write(data) {
        this.output += data;
    }

    getOutput() {
        return this.output;
    }
}

class Console {
    constructor(writer) {
        this.writer = writer;
    }

    colorize(str, styleClass) {
        return this.writer.colorize(str, styleClass);
    }

    write(str) {
        this.writer.write(str);
    }

    println(str) {
        this.writer.write(`${str}\n`);
    }
}

module.exports = IstanbulReports;