const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const config = {
  silent: false,
  fatal: false,
  verbose: false,
};

function echo(...args) {
  const message = args.join(' ');
  if (!config.silent) console.log(message);
  return message;
}

function pwd() {
  return process.cwd();
}

function cd(targetDir = path.resolve('/')) {
  process.chdir(targetDir);
  return targetDir;
}

function ls(...args) {
  const options = args[0]?.startsWith('-') ? args.shift() : '';
  const targetDirs = args.length ? args : ['.'];
  const allFiles = [];

  targetDirs.forEach(dir => {
    const files = options.includes('-R')
      ? glob.sync(`${dir}/**/*`, { dot: options.includes('-A') })
      : glob.sync(`${dir}/*`, { dot: options.includes('-A') });
    allFiles.push(...files);
  });

  return allFiles.filter(file => options.includes('-d') || !fs.statSync(file).isDirectory());
}

function cp(source, destination, options = '') {
  const srcArray = Array.isArray(source) ? source : [source];
  srcArray.forEach(src => {
    const destPath = fs.statSync(destination).isDirectory() ? path.join(destination, path.basename(src)) : destination;
    fs.copyFileSync(src, destPath, options.includes('-n') ? fs.constants.COPYFILE_EXCL : 0);
  });
}

function rm(...args) {
  const options = args[0]?.startsWith('-') ? args.shift() : '';
  const filesToRemove = args.flat();

  filesToRemove.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const isDir = fs.statSync(filePath).isDirectory();
      if (isDir && options.includes('-r')) {
        fs.rmSync(filePath, { recursive: true, force: options.includes('-f') });
      } else if (!isDir) {
        fs.unlinkSync(filePath);
      }
    }
  });
}

function touch(paths, options = {}) {
  const fileArray = Array.isArray(paths) ? paths : [paths];
  const date = options.date ? new Date(options.date) : new Date();

  fileArray.forEach(filePath => {
    if (options.c && !fs.existsSync(filePath)) return;
    fs.utimesSync(filePath, date, date);
  });
}

function execShell(command, options = {}, callback) {
  const execOptions = { shell: true, encoding: 'utf8', ...options };

  if (options.async) {
    return exec(command, execOptions, callback);
  } else {
    const output = execSync(command, execOptions);
    return { stdout: output.toString(), stderr: '', code: 0 };
  }
}

function which(command) {
  const availablePaths = (process.env.PATH || '').split(path.delimiter);

  for (let dir of availablePaths) {
    const commandPath = path.join(dir, command);
    if (fs.existsSync(commandPath) && fs.statSync(commandPath).isFile()) {
      return commandPath;
    }
  }
  
  throw new Error(`Command not found: ${command}`);
}

module.exports = {
  echo,
  pwd,
  cd,
  ls,
  cp,
  rm,
  touch,
  exec: execShell,
  which,
  config,
};
