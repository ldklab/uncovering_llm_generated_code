var __assign = Object.assign;
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (result) => {
      return result.done ? resolve(result.value) : Promise.resolve(result.value).then(fulfilled, rejected);
    };
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const fs = require("fs");
const os = require("os");
const path = require("path");
const zlib = require("zlib");
const https = require("https");
const child_process = require("child_process");
const version = "0.8.28";
const binPath = path.join(__dirname, "bin", "esbuild");
function installBinaryFromPackage(name, fromPath, toPath) {
  return __async(this, null, function* () {
    const cachePath = getCachePath(name);
    try {
      fs.copyFileSync(cachePath, toPath);
      fs.chmodSync(toPath, 493);
      validateBinaryVersion(toPath);
      const now = new Date();
      fs.utimesSync(cachePath, now, now);
      return;
    } catch (e) {
    }
    let buffer;
    let didFail = false;
    try {
      buffer = installUsingNPM(name, fromPath);
    } catch (err) {
      didFail = true;
      console.error(`Trying to install "${name}" using npm`);
      console.error(`Failed to install "${name}" using npm: ${err && err.message || err}`);
    }
    if (!buffer) {
      const url = `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`;
      console.error(`Trying to download ${JSON.stringify(url)}`);
      try {
        buffer = extractFileFromTarGzip(yield fetch(url), fromPath);
      } catch (err) {
        console.error(`Failed to download ${JSON.stringify(url)}: ${err && err.message || err}`);
      }
    }
    if (!buffer) {
      console.error(`Install unsuccessful`);
      process.exit(1);
    }
    fs.writeFileSync(toPath, buffer, {mode: 493});
    try {
      validateBinaryVersion(toPath);
    } catch (err) {
      console.error(`The version of the downloaded binary is incorrect: ${err && err.message || err}`);
      console.error(`Install unsuccessful`);
      process.exit(1);
    }
    try {
      fs.mkdirSync(path.dirname(cachePath), {recursive: true});
      fs.copyFileSync(toPath, cachePath);
      cleanCacheLRU(cachePath);
    } catch (e) {
    }
    if (didFail)
      console.error(`Install successful`);
  });
}
function validateBinaryVersion(binaryPath) {
  let stdout;
  try {
    stdout = child_process.execFileSync(binaryPath, ["--version"]).toString().trim();
  } catch (err) {
    if (platformKey === "darwin arm64 LE")
      throw new Error(`${err && err.message || err}

This install script is trying to install the x64 esbuild executable because the
arm64 esbuild executable is not available yet. Running this executable requires
the Rosetta 2 binary translator. Please make sure you have Rosetta 2 installed
before installing esbuild.
`);
    throw err;
  }
  if (stdout !== version) {
    throw new Error(`Expected ${JSON.stringify(version)} but got ${JSON.stringify(stdout)}`);
  }
}
function getCachePath(name) {
  const home = os.homedir();
  const common = ["esbuild", "bin", `${name}@${version}`];
  if (process.platform === "darwin")
    return path.join(home, "Library", "Caches", ...common);
  if (process.platform === "win32")
    return path.join(home, "AppData", "Local", "Cache", ...common);
  return path.join(home, ".cache", ...common);
}
function cleanCacheLRU(fileToKeep) {
  const dir = path.dirname(fileToKeep);
  const entries = [];
  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    try {
      const stats = fs.statSync(entryPath);
      entries.push({path: entryPath, mtime: stats.mtime});
    } catch (e) {
    }
  }
  entries.sort((a, b) => +b.mtime - +a.mtime);
  for (const entry of entries.slice(5)) {
    try {
      fs.unlinkSync(entry.path);
    } catch (e) {
    }
  }
}
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location)
        return fetch(res.headers.location).then(resolve, reject);
      if (res.statusCode !== 200)
        return reject(new Error(`Server responded with ${res.statusCode}`));
      let chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}
function extractFileFromTarGzip(buffer, file) {
  try {
    buffer = zlib.unzipSync(buffer);
  } catch (err) {
    throw new Error(`Invalid gzip data in archive: ${err && err.message || err}`);
  }
  let str = (i, n) => String.fromCharCode(...buffer.subarray(i, i + n)).replace(/\0.*$/, "");
  let offset = 0;
  file = `package/${file}`;
  while (offset < buffer.length) {
    let name = str(offset, 100);
    let size = parseInt(str(offset + 124, 12), 8);
    offset += 512;
    if (!isNaN(size)) {
      if (name === file)
        return buffer.subarray(offset, offset + size);
      offset += size + 511 & ~511;
    }
  }
  throw new Error(`Could not find ${JSON.stringify(file)} in archive`);
}
function installUsingNPM(name, file) {
  const installDir = path.join(os.tmpdir(), "esbuild-" + Math.random().toString(36).slice(2));
  fs.mkdirSync(installDir, {recursive: true});
  fs.writeFileSync(path.join(installDir, "package.json"), "{}");
  const env = __assign(__assign({}, process.env), {npm_config_global: void 0});
  child_process.execSync(`npm install --loglevel=error --prefer-offline --no-audit --progress=false ${name}@${version}`, {cwd: installDir, stdio: "pipe", env});
  const buffer = fs.readFileSync(path.join(installDir, "node_modules", name, file));
  try {
    removeRecursive(installDir);
  } catch (e) {
  }
  return buffer;
}
function removeRecursive(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    let stats;
    try {
      stats = fs.lstatSync(entryPath);
    } catch (e) {
      continue;
    }
    if (stats.isDirectory())
      removeRecursive(entryPath);
    else
      fs.unlinkSync(entryPath);
  }
  fs.rmdirSync(dir);
}
function isYarnBerryOrNewer() {
  const {npm_config_user_agent} = process.env;
  if (npm_config_user_agent) {
    const match = npm_config_user_agent.match(/yarn\/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10) >= 2;
    }
  }
  return false;
}
function installDirectly(name) {
  if (process.env.ESBUILD_BIN_PATH_FOR_TESTS) {
    fs.unlinkSync(binPath);
    fs.symlinkSync(process.env.ESBUILD_BIN_PATH_FOR_TESTS, binPath);
    validateBinaryVersion(process.env.ESBUILD_BIN_PATH_FOR_TESTS);
  } else {
    installBinaryFromPackage(name, "bin/esbuild", binPath).catch((e) => setImmediate(() => {
      throw e;
    }));
  }
}
function installWithWrapper(name, fromPath, toPath) {
  fs.writeFileSync(binPath, `#!/usr/bin/env node
const path = require('path');
const esbuild_exe = path.join(__dirname, '..', ${JSON.stringify(toPath)});
const child_process = require('child_process');
const { status } = child_process.spawnSync(esbuild_exe, process.argv.slice(2), { stdio: 'inherit' });
process.exitCode = status === null ? 1 : status;
`);
  const absToPath = path.join(__dirname, toPath);
  if (process.env.ESBUILD_BIN_PATH_FOR_TESTS) {
    fs.copyFileSync(process.env.ESBUILD_BIN_PATH_FOR_TESTS, absToPath);
    validateBinaryVersion(process.env.ESBUILD_BIN_PATH_FOR_TESTS);
  } else {
    installBinaryFromPackage(name, fromPath, absToPath).catch((e) => setImmediate(() => {
      throw e;
    }));
  }
}
function installOnUnix(name) {
  if (isYarnBerryOrNewer()) {
    installWithWrapper(name, "bin/esbuild", "esbuild");
  } else {
    installDirectly(name);
  }
}
function installOnWindows(name) {
  installWithWrapper(name, "esbuild.exe", "esbuild.exe");
}
const platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`;
const knownWindowsPackages = {
  "win32 ia32 LE": "esbuild-windows-32",
  "win32 x64 LE": "esbuild-windows-64"
};
const knownUnixlikePackages = {
  "darwin x64 LE": "esbuild-darwin-64",
  "darwin arm64 LE": "esbuild-darwin-64",
  "freebsd arm64 LE": "esbuild-freebsd-arm64",
  "freebsd x64 LE": "esbuild-freebsd-64",
  "linux arm LE": "esbuild-linux-arm",
  "linux arm64 LE": "esbuild-linux-arm64",
  "linux ia32 LE": "esbuild-linux-32",
  "linux mips64el LE": "esbuild-linux-mips64le",
  "linux ppc64 LE": "esbuild-linux-ppc64le",
  "linux x64 LE": "esbuild-linux-64"
};
if (platformKey in knownWindowsPackages) {
  installOnWindows(knownWindowsPackages[platformKey]);
} else if (platformKey in knownUnixlikePackages) {
  installOnUnix(knownUnixlikePackages[platformKey]);
} else {
  console.error(`Unsupported platform: ${platformKey}`);
  process.exit(1);
}
