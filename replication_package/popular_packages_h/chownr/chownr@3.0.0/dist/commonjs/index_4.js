"use strict";
const fs = require("node:fs");
const path = require("node:path");

const lchownSync = (filePath, uid, gid) => {
    try {
        return fs.lchownSync(filePath, uid, gid);
    } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
    }
};

const chown = (filePath, uid, gid, callback) => {
    fs.lchown(filePath, uid, gid, error => {
        callback(error && error?.code !== 'ENOENT' ? error : null);
    });
};

const chownrKid = (parentPath, child, uid, gid, callback) => {
    const childPath = path.resolve(parentPath, child.name);
    if (child.isDirectory()) {
        chownr(childPath, uid, gid, error => {
            if (error) return callback(error);
            chown(childPath, uid, gid, callback);
        });
    } else {
        chown(childPath, uid, gid, callback);
    }
};

const chownr = (directoryPath, uid, gid, callback) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (error, children) => {
        if (error) {
            if (error.code === 'ENOENT') return callback();
            if (error.code !== 'ENOTDIR' && error.code !== 'ENOTSUP') return callback(error);
        }
        if (error || !children.length) return chown(directoryPath, uid, gid, callback);

        let pending = children.length;
        const handleError = err => {
            if (err) return callback(err);
            if (--pending === 0) chown(directoryPath, uid, gid, callback);
        };
        for (const child of children) {
            chownrKid(directoryPath, child, uid, gid, handleError);
        }
    });
};

const chownrKidSync = (parentPath, child, uid, gid) => {
    const childPath = path.resolve(parentPath, child.name);
    if (child.isDirectory()) chownrSync(childPath, uid, gid);
    lchownSync(childPath, uid, gid);
};

const chownrSync = (directoryPath, uid, gid) => {
    let children;
    try {
        children = fs.readdirSync(directoryPath, { withFileTypes: true });
    } catch (error) {
        if (error?.code === 'ENOENT') return;
        if (error?.code === 'ENOTDIR' || error?.code === 'ENOTSUP') return lchownSync(directoryPath, uid, gid);
        throw error;
    }
    for (const child of children) {
        chownrKidSync(directoryPath, child, uid, gid);
    }
    return lchownSync(directoryPath, uid, gid);
};

exports.chownr = chownr;
exports.chownrSync = chownrSync;
