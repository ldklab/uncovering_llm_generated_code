"use strict";
/***
 * Node External Editor Rewritten
 *
 * Kevin Gravier <kevin@mrkmg.com>
 * MIT 2019
 */
const { detect } = require("chardet");
const { spawnSync, spawn } = require("child_process");
const { readFileSync, writeFileSync, unlinkSync } = require("fs");
const { decode, encodingExists } = require("iconv-lite");
const { tmpNameSync } = require("tmp");
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
        return str.split(/(?<!\\) /).map(piece => piece.replace("\\ ", " "));
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
        this.launchEditorAsync((err) => {
            if (err) return setImmediate(callback, err);
            try {
                this.readTemporaryFile();
                setImmediate(callback, null, this.text);
            } catch (readError) {
                setImmediate(callback, readError, null);
            }
        });
    }

    cleanup() {
        this.removeTemporaryFile();
    }

    determineEditor() {
        const editorEnv = process.env.VISUAL || process.env.EDITOR;
        const defaultEditor = /^win/.test(process.platform) ? "notepad" : "vim";
        const editorConfig = ExternalEditor.splitStringBySpace(editorEnv || defaultEditor);
        this.editor = { bin: editorConfig[0], args: editorConfig.slice(1) };
    }

    createTemporaryFile() {
        try {
            this.tempFile = tmpNameSync(this.fileOptions);
            const fileOptions = { encoding: "utf8", mode: this.fileOptions.mode };
            writeFileSync(this.tempFile, this.text, fileOptions);
        } catch (error) {
            throw new CreateFileError(error);
        }
    }

    readTemporaryFile() {
        try {
            const fileContent = readFileSync(this.tempFile);
            const encoding = detect(fileContent) || "utf8";
            this.text = encodingExists(encoding) ? decode(fileContent, encoding) : decode(fileContent, "utf8");
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
            const { status } = spawnSync(this.editor.bin, [...this.editor.args, this.tempFile], { stdio: "inherit" });
            this.lastExitStatus = status;
        } catch (error) {
            throw new LaunchEditorError(error);
        }
    }

    launchEditorAsync(callback) {
        try {
            const process = spawn(this.editor.bin, [...this.editor.args, this.tempFile], { stdio: "inherit" });
            process.on("exit", (code) => {
                this.lastExitStatus = code;
                setImmediate(callback);
            });
        } catch (error) {
            throw new LaunchEditorError(error);
        }
    }
}
exports.ExternalEditor = ExternalEditor;
