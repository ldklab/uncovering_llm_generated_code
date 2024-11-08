markdown
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class CustomError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}

class FileError extends CustomError {}
class EditorError extends CustomError {}

class EditorManager {
  constructor(text = '', options = {}) {
    this.text = text;
    this.options = options;
    this.tempFilePath = this.createTemporaryFile();
    this.editorConfig = thisidentifyEditor();
    this.exitStatus = null;
  }

  createTemporaryFile() {
    try {
      const defaultPrefix = 'editor-temp-';
      const defaultSuffix = '.txt';
      const tempFile = path.join(os.tmpdir(), `${defaultPrefix}${Date.now()}${defaultSuffix}`);
      fs.writeFileSync(tempFile, this.text, { mode: this.options.fileMode || 0o644 });
      return tempFile;
    } catch (error) {
      throw new FileError('Error creating temporary file', error);
    }
  }

  identifyEditor() {
    const editorBinary = process.env.VISUAL || process.env.EDITOR || 'vi';
    return { bin: editorBinary, args: [] };
  }

  execute() {
    try {
      execSync(`${this.editorConfig.bin} ${this.tempFilePath}`, { stdio: 'inherit' });
      const editedText = fs.readFileSync(this.tempFilePath, 'utf8');
      this.exitStatus = 0;
      return editedText;
    } catch (error) {
      this.exitStatus = error.status === undefined ? null : error.status;
      throw new EditorError('Error launching editor', error);
    }
  }

  executeAsync(callback) {
    exec(`${this.editorConfig.bin} ${this.tempFilePath}`, (error) => {
      if (error) {
        callback(new EditorError('Error launching editor asynchronously', error));
      } else {
        try {
          const editedText = fs.readFileSync(this.tempFilePath, 'utf8');
          callback(null, editedText);
        } catch (readError) {
          callback(new FileError('Error reading temporary file', readError));
        }
      }
    });
  }

  removeTemporaryFile() {
    try {
      fs.unlinkSync(this.tempFilePath);
    } catch (error) {
      throw new FileError('Error removing temporary file', error);
    }
  }
}

function syncEdit(text = '', options = {}) {
  const manager = new EditorManager(text, options);
  const result = manager.execute();
  manager.removeTemporaryFile();
  return result;
}

function asyncEdit(text = '', callback, options = {}) {
  const manager = new EditorManager(text, options);
  manager.executeAsync((err, result) => {
    if (!err) {
      manager.removeTemporaryFile();
    }
    callback(err, result);
  });
}

module.exports = {
  syncEdit,
  asyncEdit,
  EditorManager,
  FileError,
  EditorError,
};
