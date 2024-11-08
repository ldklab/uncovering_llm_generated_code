const fs = require('fs');
const path = require('path');

const isExecutable = (filePath, pathExt) => {
  const extensions = pathExt.split(';');
  return extensions.some(ext => filePath.endsWith(ext)) && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
};

const findExecutable = (executable, options = {}) => {
  const searchPaths = (options.path || process.env.PATH || '').split(path.delimiter);
  const extensions = options.pathExt || process.env.PATHEXT || (process.platform === 'win32' ? '.EXE;.CMD;.BAT;.COM' : '');

  const results = [];

  for (const dir of searchPaths) {
    const fullPath = path.join(dir, executable);
    if (isExecutable(fullPath, extensions)) {
      if (options.all) {
        results.push(fullPath);
      } else {
        return fullPath;
      }
    }
  }

  return options.all ? results : null;
};

const which = async (executable, options = {}) => {
  return new Promise((resolve, reject) => {
    const found = findExecutable(executable, options);
    if (found || options.nothrow) {
      resolve(found);
    } else {
      reject(new Error(`not found: ${executable}`));
    }
  });
};

which.sync = (executable, options = {}) => {
  const found = findExecutable(executable, options);
  if (!found && !options.nothrow) {
    throw new Error(`not found: ${executable}`);
  }
  return found;
};

module.exports = which;

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    all: args.includes('-a'),
    nothrow: args.includes('-s')
  };

  const programs = args.filter(arg => !arg.startsWith('-'));
  if (programs.length === 0) {
    console.error('usage: node-which [-as] program ...');
    process.exit(1);
  }

  programs.forEach(program => {
    try {
      const result = which.sync(program, options);
      if (Array.isArray(result)) {
        result.forEach(res => console.log(res));
      } else if (result) {
        console.log(result);
      }
    } catch (error) {
      if (!options.nothrow) {
        console.error(error.message);
        process.exit(1);
      }
    }
  });
}
