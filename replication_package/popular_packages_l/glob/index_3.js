const fs = require('fs');
const path = require('path');

class SimpleGlob {
  constructor(pattern, options = {}) {
    this.pattern = pattern;
    this.options = options;
  }

  async find() {
    const rootPath = this.options.basePath || '.';
    const collectedFiles = await this.traverse(rootPath);
    return collectedFiles.filter(file => this.isMatch(file));
  }

  async traverse(directory) {
    try {
      const dirContents = await fs.promises.readdir(directory, { withFileTypes: true });
      const paths = await Promise.all(dirContents.map(dirent => {
        const resolvedPath = path.resolve(directory, dirent.name);
        return dirent.isDirectory() ? this.traverse(resolvedPath) : resolvedPath;
      }));
      return paths.flat();
    } catch (error) {
      throw error;
    }
  }

  isMatch(filePath) {
    const regex = new RegExp(this.pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, "."));
    return regex.test(filePath);
  }

  static async glob(pattern, options) {
    const instance = new SimpleGlob(pattern, options);
    return instance.find();
  }
}

// Usage example:
SimpleGlob.glob('**/*.js', { basePath: './my-project' })
  .then(files => console.log(files))
  .catch(err => console.error(err));
