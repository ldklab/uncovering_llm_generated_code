markdown
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class CreateFileError extends Error {}
class ReadFileError extends Error {}
class LaunchEditorError extends Error {}
class RemoveFileError extends Error {}

class ExternalEditor {
  constructor(text = '', config = {}) {
    this.text = text;
    this.config = config;
    this.tempFile = this.createTempFile();
    this.editor = this.getEditorConfig();
    this.lastExitStatus = null;
  }

  createTempFile() {
    try {
      const prefix = this.config.prefix || 'external-editor-';
      const postfix = this.config.postfix || '.txt';
      const tempPath = path.join(os.tmpdir(), prefix + Date.now() + postfix);
      fs.writeFileSync(tempPath, this.text, { mode: this.config.mode || 0o644 });
      return tempPath;
    } catch (e) {
      throw new CreateFileError('Failed to create the temporary file', e);
    }
  }

  getEditorConfig() {
    const editor = process.env.VISUAL || process.env.EDITOR || 'vi';
    return { bin: editor, args: [] };
  }

  run() {
    try {
      execSync(`${this.editor.bin} ${this.tempFile}`, { stdio: 'inherit' });
      const resultText = fs.readFileSync(this.tempFile, 'utf8');
      this.lastExitStatus = 0;
      return resultText;
    } catch (e) {
      if (e.status !== undefined) this.lastExitStatus = e.status;
      throw new LaunchEditorError('Failed to launch your editor', e);
    }
  }

  runAsync(callback) {
    exec(`${this.editor.bin} ${this.tempFile}`, (err) => {
      if (err) {
        callback(new LaunchEditorError('Failed to launch your editor', err));
      } else {
        try {
          const resultText = fs.readFileSync(this.tempFile, 'utf8');
          callback(null, resultText);
        } catch (e) {
          callback(new ReadFileError('Failed to read the temporary file', e));
        }
      }
    });
  }

  cleanup() {
    try {
      fs.unlinkSync(this.tempFile);
    } catch (e) {
      throw new RemoveFileError('Failed to remove the temporary file', e);
    }
  }
}

function edit(text = '', config = {}) {
  const editor = new ExternalEditor(text, config);
  const result = editor.run();
  editor.cleanup();
  return result;
}

function editAsync(text = '', callback, config = {}) {
  const editor = new ExternalEditor(text, config);
  editor.runAsync((err, result) => {
    if (!err) {
      editor.cleanup();
    }
    callback(err, result);
  });
}

module.exports = {
  edit,
  editAsync,
  ExternalEditor,
  CreateFileError,
  ReadFileError,
  LaunchEditorError,
  RemoveFileError,
};
