"use strict";
const fs = require("node:fs");
const path = require("node:path");

const handleLchownSync = (filePath, uid, gid) => {
    try {
        fs.lchownSync(filePath, uid, gid);
    } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
    }
};

const handleChown = (filePath, uid, gid, callback) => {
    fs.lchown(filePath, uid, gid, (error) => {
        callback(error && error?.code !== 'ENOENT' ? error : null);
    });
};

const chownrInnerAsync = (rootPath, entry, uid, gid, callback) => {
    const entryPath = path.resolve(rootPath, entry.name);
    if (entry.isDirectory()) {
        exports.chownr(entryPath, uid, gid, (error) => {
            if (error) return callback(error);
            handleChown(entryPath, uid, gid, callback);
        });
    } else {
        handleChown(entryPath, uid, gid, callback);
    }
};

const chownr = (dirPath, uid, gid, callback) => {
    fs.readdir(dirPath, { withFileTypes: true }, (error, entries) => {
        if (error) {
            if (error.code === 'ENOENT') return callback();
            else if (error.code !== 'ENOTDIR' && error.code !== 'ENOTSUP') return callback(error);
        }
        if (!entries || !entries.length) return handleChown(dirPath, uid, gid, callback);

        let remaining = entries.length;
        let errorState = null;

        const onEntryProcessed = (error) => {
            if (errorState) return;
            if (error) return callback((errorState = error));
            if (--remaining === 0) handleChown(dirPath, uid, gid, callback);
        };

        for (const entry of entries) {
            chownrInnerAsync(dirPath, entry, uid, gid, onEntryProcessed);
        }
    });
};
exports.chownr = chownr;

const chownrInnerSync = (rootPath, entry, uid, gid) => {
    const entryPath = path.resolve(rootPath, entry.name);
    if (entry.isDirectory()) {
        exports.chownrSync(entryPath, uid, gid);
    }
    handleLchownSync(entryPath, uid, gid);
};

const chownrSync = (dirPath, uid, gid) => {
    let entries;
    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (error) {
        if (error?.code === 'ENOENT') return;
        else if (error?.code === 'ENOTDIR' || error?.code === 'ENOTSUP') {
            handleLchownSync(dirPath, uid, gid);
            return;
        } else {
            throw error;
        }
    }

    for (const entry of entries) {
        chownrInnerSync(dirPath, entry, uid, gid);
    }
    handleLchownSync(dirPath, uid, gid);
};
exports.chownrSync = chownrSync;
