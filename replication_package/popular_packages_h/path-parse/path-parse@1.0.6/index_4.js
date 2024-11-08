'use strict';

const isWindows = process.platform === 'win32';

// Regex to split a windows path into three parts: [*, device, slash, tail]
const splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
const splitTailRe = /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

const win32 = {
  splitPath(filename) {
    const result = splitDeviceRe.exec(filename);
    const device = (result[1] || '') + (result[2] || '');
    const tail = result[3] || '';
    const result2 = splitTailRe.exec(tail);
    const dir = result2[1];
    const basename = result2[2];
    const ext = result2[3];
    return [device, dir, basename, ext];
  },
  
  parse(pathString) {
    if (typeof pathString !== 'string') {
      throw new TypeError(`Parameter 'pathString' must be a string, not ${typeof pathString}`);
    }
    const allParts = this.splitPath(pathString);
    if (!allParts || allParts.length !== 4) {
      throw new TypeError(`Invalid path '${pathString}'`);
    }
    return {
      root: allParts[0],
      dir: allParts[0] + allParts[1].slice(0, -1),
      base: allParts[2],
      ext: allParts[3],
      name: allParts[2].slice(0, allParts[2].length - allParts[3].length),
    };
  }
};

const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

const posix = {
  splitPath(filename) {
    return splitPathRe.exec(filename).slice(1);
  },
  
  parse(pathString) {
    if (typeof pathString !== 'string') {
      throw new TypeError(`Parameter 'pathString' must be a string, not ${typeof pathString}`);
    }
    const allParts = this.splitPath(pathString);
    if (!allParts || allParts.length !== 4) {
      throw new TypeError(`Invalid path '${pathString}'`);
    }
    allParts[1] = allParts[1] || '';
    allParts[2] = allParts[2] || '';
    allParts[3] = allParts[3] || '';
    return {
      root: allParts[0],
      dir: allParts[0] + allParts[1].slice(0, -1),
      base: allParts[2],
      ext: allParts[3],
      name: allParts[2].slice(0, allParts[2].length - allParts[3].length),
    };
  }
};

module.exports = isWindows ? win32.parse : posix.parse;
module.exports.posix = posix.parse;
module.exports.win32 = win32.parse;
