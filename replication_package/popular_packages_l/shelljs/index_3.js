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
  if (!config.silent) process.stdout.write(message + '\n');
  return message;
}

function pwd() {
  return process.cwd();
}

function cd(targetDir) {
  const dir = targetDir || path.resolve('/');
  process.chdir(dir);
  return dir;
}

function ls(...args) {
  const option = args[0].startsWith('-') ? args.shift() : '';
  const directories = args.length > 0 ? args : ['.'];
  const resultFiles = [];

  directories.forEach(dir => {
    const pattern = option.includes('-R') ? `${dir}/**/*` : `${dir}/*`;
    const matches = glob.sync(pattern, { dot: option.includes('-A') });
    resultFiles.push(...matches);
  });

  return resultFiles.filter(file => option.includes('-d') || !fs.statSync(file).isDirectory());
}

function cp(source, destination, optionFlag = '') {
  const sourceFiles = Array.isArray(source) ? source : [source];
  sourceFiles.forEach(src => {
    const destFile = fs.statSync(destination).isDirectory() ? path.join(destination, path.basename(src)) : destination;
    fs.copyFileSync(src, destFile, optionFlag.includes('-n') ? fs.constants.COPYFILE_EXCL : 0);
  });
}

function rm(...args) {
  const option = args[0].startsWith('-') ? args.shift() : '';
  const targetFiles = args.flat();
  
  targetFiles.forEach(target => {
    if (fs.existsSync(target)) {
      if (fs.statSync(target).isDirectory() && option.includes('-r')) {
        fs.rmSync(target, { recursive: true, force: option.includes('-f') });
      } else {
        fs.unlinkSync(target);
      }
    }
  });
}

function touch(files, options = {}) {
  const filePaths = Array.isArray(files) ? files : [files];
  filePaths.forEach(filePath => {
    const currentTime = typeof options.date === 'string' ? new Date(options.date) : new Date();
    if (options.c && !fs.existsSync(filePath)) return;
    fs.utimesSync(filePath, currentTime, currentTime);
  });
}

function execShell(command, options = {}, callback) {
  const execOptions = { shell: true, ...options, encoding: options.encoding || 'utf8' };
  if (options.async) {
    return exec(command, execOptions, callback);
  } else {
    const executionResult = execSync(command, execOptions);
    return { stdout: executionResult.toString(), stderr: '', code: 0 };
  }
}

function which(cmd) {
  const systemPath = process.env.PATH || '';
  const pathDirectories = systemPath.split(path.delimiter);
  for (let dir of pathDirectories) {
    const completePath = path.join(dir, cmd);
    if (fs.existsSync(completePath) && fs.statSync(completePath).isFile()) {
      return completePath;
    }
  }
  throw new Error(`Command not found: ${cmd}`);
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
