const fs = require('fs');
const path = require('path');

const isExecutable = (filePath, pathExt) => {
  const exts = pathExt.split(';');
  return exts.some(ext => filePath.endsWith(ext)) && fs.existsSync(filePath) && fs.statSync(filePath).isFile();
};

const findExecutableInPath = (executable, options = {}) => {
  const paths = (options.path || process.env.PATH || '').split(path.delimiter);
  const pathExt = options.pathExt || process.env.PATHEXT || (process.platform === 'win32' ? '.EXE;.CMD;.BAT;.COM' : '');
  
  const matches = [];

  for (const dir of paths) {
    const fullPath = path.join(dir, executable);
    if (isExecutable(fullPath, pathExt)) {
      if (options.all) {
        matches.push(fullPath);
      } else {
        return fullPath;
      }
    }
  }

  return options.all ? matches : null;
};

const which = async (executable, options = {}) => {
  return new Promise((resolve, reject) => {
    const result = findExecutableInPath(executable, options);
    if (result || options.nothrow) {
      resolve(result);
    } else {
      reject(new Error(`not found: ${executable}`));
    }
  });
};

which.sync = (executable, options = {}) => {
  const result = findExecutableInPath(executable, options);
  if (!result && !options.nothrow) {
    throw new Error(`not found: ${executable}`);
  }
  return result;
};

module.exports = which;

// CLI Usage
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
    } catch (err) {
      if (!options.nothrow) {
        console.error(err.message);
        process.exit(1);
      }
    }
  });
}
