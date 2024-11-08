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
  if (!config.silent) process.stdout.write(str + '\n');
  return str;
}

function pwd() {
  return process.cwd();
}

function cd(dir) {
  const newDir = dir || path.resolve('/');
  process.chdir(newDir);
  return newDir;
}

function ls(...args) {
  const options = args[0].startsWith('-') ? args.shift() : '';
  const dirs = args.length > 0 ? args : ['.'];
  const files = [];

  dirs.forEach(dir => {
    const filesInDir = options.includes('-R')
      ? glob.sync(`${dir}/**/*`, { dot: options.includes('-A') })
      : glob.sync(`${dir}/*`, { dot: options.includes('-A') });
    files.push(...filesInDir);
  });

  return files.filter(file => (options.includes('-d') || !fs.statSync(file).isDirectory()));
}

function cp(source, dest, options = '') {
  const sources = Array.isArray(source) ? source : [source];
  sources.forEach(src => {
    const target = fs.statSync(dest).isDirectory() ? path.join(dest, path.basename(src)) : dest;
    fs.copyFileSync(src, target, options.includes('-n') ? fs.constants.COPYFILE_EXCL : 0);
  });
}

function rm(...args) {
  const options = args[0].startsWith('-') ? args.shift() : '';
  const files = args.flat();
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      if (fs.statSync(file).isDirectory() && options.includes('-r')) {
        fs.rmSync(file, { recursive: true, force: options.includes('-f') });
      } else {
        fs.unlinkSync(file);
      }
    }
  });
}

function touch(files, options = {}) {
  const paths = Array.isArray(files) ? files : [files];
  paths.forEach(file => {
    const time = typeof options.date === 'string' ? new Date(options.date) : new Date();
    if (options.c && !fs.existsSync(file)) return;
    fs.utimesSync(file, time, time);
  });
}

function execShell(cmd, options = {}, callback) {
  const execOpts = { shell: true, ...options, encoding: options.encoding || 'utf8' };
  if (options.async) {
    return exec(cmd, execOpts, callback);
  } else {
    const result = execSync(cmd, execOpts);
    return { stdout: result.toString(), stderr: '', code: 0 };
  }
}

function which(command) {
  const envPath = process.env.PATH || '';
  const paths = envPath.split(path.delimiter);
  for (let p of paths) {
    const fullPath = path.join(p, command);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
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
