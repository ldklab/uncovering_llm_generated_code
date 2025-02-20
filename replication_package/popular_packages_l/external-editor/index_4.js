const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class FileError extends Error {}
class EditorError extends Error {}

class ExternalEditor {
  constructor(text = '', config = {}) {
    this.text = text;
    this.config = config;
    this.tempFile = this.createTempFile(text);
    this.editorCommand = this.getEditorCommand();
    this.lastExitStatus = null;
  }

  createTempFile(content) {
    const prefix = this.config.prefix || 'external-editor-';
    const postfix = this.config.postfix || '.txt';
    const tempFilePath = path.join(os.tmpdir(), `${prefix}${Date.now()}${postfix}`);

    try {
      fs.writeFileSync(tempFilePath, content, { mode: this.config.mode || 0o644 });
      return tempFilePath;
    } catch (err) {
      throw new FileError('Failed to create temporary file', err);
    }
  }

  getEditorCommand() {
    return process.env.VISUAL || process.env.EDITOR || 'vi';
  }

  run() {
    try {
      execSync(`${this.editorCommand} ${this.tempFile}`, { stdio: 'inherit' });
      const editedText = fs.readFileSync(this.tempFile, 'utf8');
      this.lastExitStatus = 0;
      return editedText;
    } catch (err) {
      if (err.status !== undefined) this.lastExitStatus = err.status;
      throw new EditorError('Failed to launch the editor', err);
    }
  }

  runAsync(callback) {
    exec(`${this.editorCommand} ${this.tempFile}`, (err) => {
      if (err) {
        return callback(new EditorError('Failed to launch the editor', err));
      }
      try {
        const editedText = fs.readFileSync(this.tempFile, 'utf8');
        callback(null, editedText);
      } catch (readErr) {
        callback(new FileError('Failed to read temporary file', readErr));
      }
    });
  }

  cleanup() {
    try {
      fs.unlinkSync(this.tempFile);
    } catch (err) {
      throw new FileError('Failed to remove temporary file', err);
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
  FileError,
  EditorError,
};
