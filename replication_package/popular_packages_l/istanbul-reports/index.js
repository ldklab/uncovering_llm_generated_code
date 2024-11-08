class IstanbulReports {
    constructor() {
        this.writer = new Writer();
        this.console = new Console(this.writer);
    }

    node = {
        getRelativeName: (fullPath) => {
            const basePath = process.cwd();
            return fullPath.replace(basePath, '').replace(/^\/|\\/, '');
        }
    }

    context = {
        getSource: (filePath) => {
            const fs = require('fs');
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf-8');
            }
            throw new Error(`File not found: ${filePath}`);
        },

        classForPercent: (type, percent) => {
            if (percent === 100) return 'high';
            if (percent >= 80) return 'medium';
            return 'low';
        },

        console: {
            colorize: (str, styleClass) => {
                const styles = {
                    high: '\x1b[32m',    // green
                    medium: '\x1b[33m',  // yellow
                    low: '\x1b[31m',     // red
                    reset: '\x1b[0m'
                };
                return `${styles[styleClass] || ''}${str}${styles.reset}`;
            },

            write: (str) => {
                this.writer.write(str);
            },

            println: (str) => {
                this.writer.write(`${str}\n`);
            }
        }
    }
}

class Writer {
    constructor() {
        this.output = '';
    }

    write(data) {
        this.output += data;
        // In real usage, you'd perhaps write this to an actual file or console.
    }

    getOutput() {
        return this.output;
    }
}

class Console {
    constructor(writer) {
        this.writer = writer;
    }

    colorize(str, deviceClass) {
        return this.writer.colorize(str, deviceClass);
    }

    write(str) {
        this.writer.write(str);
    }

    println(str) {
        this.writer.write(`${str}\n`);
    }
}

module.exports = IstanbulReports;
