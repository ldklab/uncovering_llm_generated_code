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
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const results = await Promise.all(entries.map(async entry => {
      const resPath = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return this.walk(resPath);
      } 
      return resPath;
    }));
    return results.flat();
  }

  matches(filePath) {
    const escapedPattern = this.pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const pattern = new RegExp(escapedPattern);
    return pattern.test(filePath);
  }

  static async glob(pattern, options) {
    const globber = new SimpleGlob(pattern, options);
    return globber.glob();
  }
}

// Usage example:
SimpleGlob.glob('**/*.js', { basePath: './my-project' })
  .then(files => console.log(files))
  .catch(err => console.error('Error:', err));
