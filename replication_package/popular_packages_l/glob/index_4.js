const fs = require('fs').promises;
const path = require('path');

class SimpleGlob {
  constructor(pattern, options = {}) {
    this.pattern = pattern;
    this.options = options;
  }

  async glob() {
    const basePath = this.options.basePath || '.';
    const files = await this.walk(basePath);
    return files.filter(file => this.matches(file));
  }

  async walk(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const paths = entries.map(async entry => {
        const resPath = path.resolve(dir, entry.name);
        return entry.isDirectory() ? this.walk(resPath) : resPath;
      });
      return (await Promise.all(paths)).flat();
    } catch (error) {
      throw new Error(`Error reading directory ${dir}: ${error.message}`);
    }
  }

  matches(filePath) {
    const regexPattern = this.pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".");
    const pattern = new RegExp(regexPattern);
    return pattern.test(filePath);
  }

  static async glob(pattern, options) {
    const globInstance = new SimpleGlob(pattern, options);
    return globInstance.glob();
  }
}

// Usage example
SimpleGlob.glob('**/*.js', { basePath: './my-project' })
  .then(files => console.log(files))
  .catch(err => console.error(err));
