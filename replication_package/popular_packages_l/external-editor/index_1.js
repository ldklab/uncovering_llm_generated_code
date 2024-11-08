const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class EditorError extends Error {}

class ExternalEditor {
  constructor(text = '', options = {}) {
    this.text = text;
    this.options = options;
    this.tempFile = this.createTempFile();
    this.editorCommand = this.determineEditorCommand();
  }

  createTempFile() {
    try {
      const prefix = this.options.prefix || 'temp-editor-';
      const postfix = this.options.postfix || '.txt';
      const tempFilePath = path.join(os.tmpdir(), prefix + Date.now() + postfix);
      fs.writeFileSync(tempFilePath, this.text, { mode: this.options.mode || 0o644 });
      return tempFilePath;
    } catch (err) {
      throw new EditorError('Error creating temporary file', err);
    }
  }

  determineEditorCommand() {
    const defaultEditor = 'vi';
    return process.env.VISUAL || process.env.EDITOR || defaultEditor;
  }

  openEditorSync() {
    try {
      execSync(`${this.editorCommand} ${this.tempFile}`, { stdio: 'inherit' });
      return fs.readFileSync(this.tempFile, 'utf8');
    } catch (err) {
      throw new EditorError('Error launching editor', err);
    }
  }

  openEditorAsync(callback) {
    exec(`${this.editorCommand} ${this.tempFile}`, (err) => {
      if (err) {
        return callback(new EditorError('Error launching editor asynchronously', err));
      }
      try {
        const editedContents = fs.readFileSync(this.tempFile, 'utf8');
        callback(null, editedContents);
      } catch (readErr) {
        callback(new EditorError('Error reading from temporary file asynchronously', readErr));
      }
    });
  }

  deleteTempFile() {
    try {
      fs.unlinkSync(this.tempFile);
    } catch (err) {
      throw new EditorError('Error deleting temporary file', err);
    }
  }
}

function edit(text = '', options = {}) {
  const editor = new ExternalEditor(text, options);
  const editedContent = editor.openEditorSync();
  editor.deleteTempFile();
  return editedContent;
}

function editAsync(text = '', callback, options = {}) {
  const editor = new ExternalEditor(text, options);
  editor.openEditorAsync((err, contents) => {
    if (!err) {
      editor.deleteTempFile();
    }
    callback(err, contents);
  });
}

module.exports = {
  edit,
  editAsync,
  ExternalEditor,
};
