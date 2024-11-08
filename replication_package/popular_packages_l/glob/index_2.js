const fs = require('fs').promises;
const path = require('path');

class SimpleGlob {
  constructor(pattern, options = {}) {
    this.pattern = pattern;
    this.basePath = options.basePath || '.';
  }

  async glob() {
    const files = await this.walk(this.basePath);
    return files.filter(file => this.isMatch(file));
  }

  async walk(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const results = await Promise.all(entries.map(entry => {
        const resPath = path.resolve(dir, entry.name);
        return entry.isDirectory() ? this.walk(resPath) : [resPath];
      }));
      return results.flat();
    } catch (error) {
      throw error;
    }
  }

  isMatch(filePath) {
    const regex = new RegExp(this.pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.'));
    return regex.test(filePath);
  }

  static async glob(pattern, options) {
    const instance = new SimpleGlob(pattern, options);
    return await instance.glob();
  }
}

// Usage example:
SimpleGlob.glob('**/*.js', { basePath: './my-project' })
  .then(files => console.log(files))
  .catch(err => console.error(err));
