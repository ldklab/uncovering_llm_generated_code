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
  const str = args.join(' ');
  if (!config.silent) console.log(str);
  return str;
}

function pwd() {
  return process.cwd();
}

function cd(dir) {
  const newDir = dir || '/';
  process.chdir(newDir);
  return process.cwd();
}

function ls(...args) {
  const hasOption = args[0] && args[0].startsWith('-');
  const option = hasOption ? args.shift() : '';
  const directories = args.length > 0 ? args : ['.'];
  let files = [];

  directories.forEach((dir) => {
    let pattern = option.includes('-R') ? '**/*' : '*';
    let options = { dot: option.includes('-A') };
    let matchedFiles = glob.sync(path.join(dir, pattern), options);
    files.push(...matchedFiles);
  });

  return files.filter((file) =>
    option.includes('-d') || !fs.statSync(file).isDirectory()
  );
}

function cp(source, destination, options = '') {
  const sources = Array.isArray(source) ? source : [source];
  sources.forEach((src) => {
    const dest = fs.statSync(destination).isDirectory() 
      ? path.join(destination, path.basename(src)) 
      : destination;
    const flags = options.includes('-n') ? fs.constants.COPYFILE_EXCL : 0;
    fs.copyFileSync(src, dest, flags);
  });
}

function rm(...args) {
  const hasOption = args[0] && args[0].startsWith('-');
  const option = hasOption ? args.shift() : '';
  args.flat().forEach((file) => {
    if (fs.existsSync(file)) {
      const isDir = fs.statSync(file).isDirectory();
      if (isDir && option.includes('-r')) {
        fs.rmSync(file, { force: option.includes('-f'), recursive: true });
      } else if (!isDir) {
        fs.unlinkSync(file);
      }
    }
  });
}

function touch(files, options = {}) {
  const filePaths = Array.isArray(files) ? files : [files];
  filePaths.forEach((file) => {
    const currentDate = new Date();
    const fileTime = options.date ? new Date(options.date) : currentDate;
    if (options.c && !fs.existsSync(file)) return;
    fs.utimesSync(file, fileTime, fileTime);
  });
}

function execShell(command, options = {}, callback) {
  const execOptions = { shell: true, encoding: 'utf8', ...options };
  if (options.async) {
    exec(command, execOptions, callback);
  } else {
    const stdout = execSync(command, execOptions).toString();
    return { stdout, stderr: '', code: 0 };
  }
}

function which(cmd) {
  const envPaths = (process.env.PATH || '').split(path.delimiter);
  for (const p of envPaths) {
    const cmdPath = path.join(p, cmd);
    if (fs.existsSync(cmdPath) && fs.statSync(cmdPath).isFile()) {
      return cmdPath;
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
