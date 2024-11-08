"use strict";
/***
 * Node External Editor
 *
 * Kevin Gravier <kevin@mrkmg.com>
 * MIT 2019
 */
Object.defineProperty(exports, "__esModule", { value: true });

const chardet = require("chardet");
const { spawn, spawnSync } = require("child_process");
const { writeFileSync, readFileSync, unlinkSync } = require("fs");
const { decode, encodingExists } = require("iconv-lite");
const tmp = require("tmp");

const { CreateFileError } = require("./errors/CreateFileError");
const { LaunchEditorError } = require("./errors/LaunchEditorError");
const { ReadFileError } = require("./errors/ReadFileError");
const { RemoveFileError } = require("./errors/RemoveFileError");

function edit(text = "", fileOptions) {
    const editor = new ExternalEditor(text, fileOptions);
    editor.run();
    editor.cleanup();
    return editor.text;
}
exports.edit = edit;

function editAsync(text = "", callback, fileOptions) {
    const editor = new ExternalEditor(text, fileOptions);
    editor.runAsync((err, result) => {
        if (err) {
            setImmediate(callback, err, null);
        } else {
            try {
                editor.cleanup();
                setImmediate(callback, null, result);
            } catch (cleanupError) {
                setImmediate(callback, cleanupError, null);
            }
        }
    });
}
exports.editAsync = editAsync;

class ExternalEditor {
    constructor(text = "", fileOptions) {
        this.text = text;
        this.fileOptions = fileOptions || {};
        this.determineEditor();
        this.createTemporaryFile();
    }

    static splitStringBySpace(str) {
        return str.match(/(?:[^\s\\]+|\\.)+/g) || [];
    }

    get temp_file() {
        console.log("DEPRECATED: temp_file. Use tempFile moving forward.");
        return this.tempFile;
    }

    get last_exit_status() {
        console.log("DEPRECATED: last_exit_status. Use lastExitStatus moving forward.");
        return this.lastExitStatus;
    }

    run() {
        this.launchEditor();
        this.readTemporaryFile();
        return this.text;
    }

    runAsync(callback) {
        try {
            this.launchEditorAsync(() => {
                try {
                    this.readTemporaryFile();
                    setImmediate(callback, null, this.text);
                } catch (error) {
                    setImmediate(callback, error, null);
                }
            });
        } catch (error) {
            setImmediate(callback, error, null);
        }
    }

    cleanup() {
        this.removeTemporaryFile();
    }

    determineEditor() {
        const editor = process.env.VISUAL || process.env.EDITOR 
                        || (/^win/.test(process.platform) ? "notepad" : "vim");
        const [bin, ...args] = ExternalEditor.splitStringBySpace(editor).map(piece => piece.replace("\\ ", " "));
        this.editor = { bin, args };
    }

    createTemporaryFile() {
        try {
            this.tempFile = tmp.tmpNameSync(this.fileOptions);
            const options = Object.assign({ encoding: "utf8" }, this.fileOptions);
            writeFileSync(this.tempFile, this.text, options);
        } catch (error) {
            throw new CreateFileError(error);
        }
    }

    readTemporaryFile() {
        try {
            const tempFileBuffer = readFileSync(this.tempFile);
            if (tempFileBuffer.length === 0) {
                this.text = "";
            } else {
                let encoding = chardet.detect(tempFileBuffer).toString();
                if (!encodingExists(encoding)) {
                    encoding = "utf8";
                }
                this.text = decode(tempFileBuffer, encoding);
            }
        } catch (error) {
            throw new ReadFileError(error);
        }
    }

    removeTemporaryFile() {
        try {
            unlinkSync(this.tempFile);
        } catch (error) {
            throw new RemoveFileError(error);
        }
    }

    launchEditor() {
        try {
            const editorProcess = spawnSync(this.editor.bin, [...this.editor.args, this.tempFile], { stdio: "inherit" });
            this.lastExitStatus = editorProcess.status;
        } catch (error) {
            throw new LaunchEditorError(error);
        }
    }

    launchEditorAsync(callback) {
        try {
            const editorProcess = spawn(this.editor.bin, [...this.editor.args, this.tempFile], { stdio: "inherit" });
            editorProcess.on("exit", code => {
                this.lastExitStatus = code;
                setImmediate(callback);
            });
        } catch (error) {
            throw new LaunchEditorError(error);
        }
    }
}

exports.ExternalEditor = ExternalEditor;
