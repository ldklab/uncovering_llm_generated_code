"use strict";

const fs = require("node:fs");
const path = require("node:path");

function lchownSync(path, uid, gid) {
    try {
        fs.lchownSync(path, uid, gid);
    } catch (er) {
        if (er?.code !== 'ENOENT') throw er;
    }
}

function chown(cpath, uid, gid, cb) {
    fs.lchown(cpath, uid, gid, er => {
        cb(er && er?.code !== 'ENOENT' ? er : null);
    });
}

function chownrKid(p, child, uid, gid, cb) {
    const cpath = path.resolve(p, child.name);
    if (child.isDirectory()) {
        chownr(cpath, uid, gid, er => {
            if (er) return cb(er);
            chown(cpath, uid, gid, cb);
        });
    } else {
        chown(cpath, uid, gid, cb);
    }
}

function chownr(p, uid, gid, cb) {
    fs.readdir(p, { withFileTypes: true }, (er, children) => {
        if (er) {
            if (er.code === 'ENOENT') return cb();
            if (er.code !== 'ENOTDIR' && er.code !== 'ENOTSUP') return cb(er);
        }
        if (er || !children.length) return chown(p, uid, gid, cb);

        let len = children.length;
        let errState = null;
        
        const then = (er) => {
            if (errState) return;
            if (er) return cb((errState = er));
            if (--len === 0) return chown(p, uid, gid, cb);
        };

        for (const child of children) {
            chownrKid(p, child, uid, gid, then);
        }
    });
}

function chownrKidSync(p, child, uid, gid) {
    const cpath = path.resolve(p, child.name);
    if (child.isDirectory()) chownrSync(cpath, uid, gid);
    lchownSync(cpath, uid, gid);
}

function chownrSync(p, uid, gid) {
    let children;
    try {
        children = fs.readdirSync(p, { withFileTypes: true });
    } catch (er) {
        if (er.code === 'ENOENT') return;
        if (er.code === 'ENOTDIR' || er.code === 'ENOTSUP') return lchownSync(p, uid, gid);
        throw er;
    }

    for (const child of children) {
        chownrKidSync(p, child, uid, gid);
    }
    lchownSync(p, uid, gid);
}

module.exports = { chownr, chownrSync };
