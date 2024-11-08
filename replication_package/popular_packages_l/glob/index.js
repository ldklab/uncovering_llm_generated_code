const fs = require('fs');
const path = require('path');

class SimpleGlob {
  constructor(pattern, options) {
    this.pattern = pattern;
    this.options = options || {};
  }

  async glob() {
    const basePath = this.options.basePath || '.';
    const files = await this.walk(basePath);
    return files.filter(file => this.matches(file));
  }

  walk(dir) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, { withFileTypes: true }, async (err, entries) => {
        if (err) {
          return reject(err);
        }
        const results = await Promise.all(entries.map(entry => {
          const resPath = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            return this.walk(resPath);
          }
          return resPath;
        }));
        resolve(results.flat());
      });
    });
  }

  matches(filePath) {
    const pattern = new RegExp(this.pattern.replace(".", "\\.").replace("*", ".*").replace("?", "."));
    return pattern.test(filePath);
  }

  static async glob(pattern, options) {
    const g = new SimpleGlob(pattern, options);
    return g.glob();
  }
}

// Usage example:
SimpleGlob.glob('**/*.js', { basePath: './my-project' })
  .then(files => console.log(files))
  .catch(err => console.error(err));

