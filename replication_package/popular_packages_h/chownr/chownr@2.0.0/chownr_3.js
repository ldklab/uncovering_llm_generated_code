'use strict';
const fs = require('fs');
const path = require('path');

const LCHOWN_METHOD = fs.lchown ? fs.lchown.bind(fs) : fs.chown.bind(fs);
const LCHOWN_SYNC_METHOD = fs.lchownSync ? fs.lchownSync.bind(fs) : fs.chownSync.bind(fs);

const handleEISDIRIssue = fs.lchown &&
  !process.version.startsWith('v1') &&
  !process.version.startsWith('v10.') &&
  !process.version.match(/v10\.[6-9]/);

function safeLchownSync(filePath, uid, gid) {
  try {
    return LCHOWN_SYNC_METHOD(filePath, uid, gid);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function safeChownSync(filePath, uid, gid) {
  try {
    return fs.chownSync(filePath, uid, gid);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const handleEISDIRError = handleEISDIRIssue ? function(filePath, uid, gid, callback) {
  return (error) => {
    if (!error || error.code !== 'EISDIR') {
      callback(error);
    } else {
      fs.chown(filePath, uid, gid, callback);
    }
  };
} : (_, __, ___, callback) => callback();

const handleEISDIRErrorSync = handleEISDIRIssue ? function(filePath, uid, gid) {
  try {
    return safeLchownSync(filePath, uid, gid);
  } catch (error) {
    if (error.code !== 'EISDIR') throw error;
    safeChownSync(filePath, uid, gid);
  }
} : safeLchownSync;

const nodeVersion = process.version;
let readdir = (dirPath, options, callback) => fs.readdir(dirPath, options, callback);
let readdirSync = (dirPath, options) => fs.readdirSync(dirPath, options);

if (nodeVersion.startsWith('v4.')) {
  readdir = (dirPath, options, callback) => fs.readdir(dirPath, callback);
}

function chown(filePath, uid, gid, callback) {
  LCHOWN_METHOD(filePath, uid, gid, handleEISDIRError(filePath, uid, gid, (error) => {
    callback(error && error.code !== 'ENOENT' ? error : null);
  }));
}

function processChild(pathPrefix, child, uid, gid, callback) {
  const childPath = path.resolve(pathPrefix, typeof child === 'string' ? child : child.name);

  if (typeof child === 'string') {
    return fs.lstat(childPath, (error, stats) => {
      if (error) return callback(error.code !== 'ENOENT' ? error : null);
      processChild(pathPrefix, stats, uid, gid, callback);
    });
  }

  if (child.isDirectory()) {
    changeOwnershipRecursively(childPath, uid, gid, (error) => {
      if (error) return callback(error);
      chown(childPath, uid, gid, callback);
    });
  } else {
    chown(childPath, uid, gid, callback);
  }
}

function changeOwnershipRecursively(dirPath, uid, gid, callback) {
  readdir(dirPath, { withFileTypes: true }, (error, children) => {
    if (error) {
      if (error.code === 'ENOENT') return callback();
      if (error.code !== 'ENOTDIR' && error.code !== 'ENOTSUP') return callback(error);
    }
    if (error || !children.length) return chown(dirPath, uid, gid, callback);

    let remaining = children.length;
    const handleError = (err) => {
      if (err) return callback(err);
      if (--remaining === 0) return chown(dirPath, uid, gid, callback);
    };

    children.forEach((child) => processChild(dirPath, child, uid, gid, handleError));
  });
}

function processChildSync(pathPrefix, child, uid, gid) {
  const childPath = path.resolve(pathPrefix, typeof child === 'string' ? child : child.name);

  if (typeof child === 'string') {
    try {
      const stats = fs.lstatSync(childPath);
      stats.name = child;
      processChildSync(pathPrefix, stats, uid, gid);
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
  }

  if (child.isDirectory()) {
    changeOwnershipRecursivelySync(childPath, uid, gid);
  }
  handleEISDIRErrorSync(childPath, uid, gid);
}

function changeOwnershipRecursivelySync(dirPath, uid, gid) {
  let children;
  try {
    children = readdirSync(dirPath, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    if (error.code !== 'ENOTDIR' && error.code !== 'ENOTSUP') throw error;
    handleEISDIRErrorSync(dirPath, uid, gid);
    return;
  }

  if (children && children.length) {
    children.forEach((child) => processChildSync(dirPath, child, uid, gid));
  }

  handleEISDIRErrorSync(dirPath, uid, gid);
}

module.exports = changeOwnershipRecursively;
changeOwnershipRecursively.sync = changeOwnershipRecursivelySync;
