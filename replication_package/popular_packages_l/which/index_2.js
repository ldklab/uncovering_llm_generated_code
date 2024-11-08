const fs = require('fs');
const path = require('path');

function isExecutable(filePath, pathExt) {
  const extensions = pathExt.split(';');
  return extensions.some(ext => filePath.endsWith(ext)) && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function findExecutableInPath(executable, options = {}) {
  const searchPaths = (options.path || process.env.PATH || '').split(path.delimiter);
  const pathExtensions = options.pathExt || process.env.PATHEXT ||
    (process.platform === 'win32' ? '.EXE;.CMD;.BAT;.COM' : '');

  return searchPaths.reduce((found, directory) => {
    const fullPath = path.join(directory, executable);
    if (isExecutable(fullPath, pathExtensions)) {
      if (options.all) found.push(fullPath);
      else return fullPath;
    }
    return found;
  }, options.all ? [] : null);
}

async function which(executable, options = {}) {
  return new Promise((resolve, reject) => {
    const result = findExecutableInPath(executable, options);
    if (result || options.nothrow) resolve(result);
    else reject(new Error(`not found: ${executable}`));
  });
}

which.sync = function (executable, options = {}) {
  const result = findExecutableInPath(executable, options);
  if (!result && !options.nothrow) throw new Error(`not found: ${executable}`);
  return result;
};

module.exports = which;

// Command Line Interface (CLI) Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    all: args.includes('-a'),
    nothrow: args.includes('-s')
  };

  const programs = args.filter(arg => !arg.startsWith('-'));
  if (!programs.length) {
    console.error('usage: node-which [-as] program ...');
    process.exit(1);
  }

  programs.forEach(program => {
    try {
      const result = which.sync(program, options);
      if (Array.isArray(result)) result.forEach(res => console.log(res));
      else if (result) console.log(result);
    } catch (error) {
      if (!options.nothrow) {
        console.error(error.message);
        process.exit(1);
      }
    }
  });
}
