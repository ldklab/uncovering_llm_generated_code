// src/index.js
import path from 'path';

// Function to normalize paths to use forward slashes
const normalizePath = (p) => p.replace(/\\/g, '/');

// Path manipulation functions
export const resolve = (...paths) => normalizePath(path.resolve(...paths));
export const join = (...paths) => normalizePath(path.join(...paths));
export const dirname = (p) => normalizePath(path.dirname(p));
export const basename = (p, ext) => path.basename(normalizePath(p), ext);
export const extname = (p) => path.extname(normalizePath(p));

// src/utils.js
export const filename = (p) => {
  const baseName = basename(p);
  return baseName.substring(0, baseName.length - extname(p).length);
};

export const normalizeAliases = (aliases) => {
  const normalizedAliases = {};
  for (const key in aliases) {
    normalizedAliases[normalizePath(key)] = normalizePath(aliases[key]);
  }
  return normalizedAliases;
};

export const resolveAlias = (p, aliases) => {
  const aliasesNormalized = normalizeAliases(aliases);
  for (const [alias, target] of Object.entries(aliasesNormalized)) {
    if (p.startsWith(alias)) {
      return p.replace(alias, target);
    }
  }
  return p;
};

// package.json
{
  "name": "pathe",
  "version": "1.0.0",
  "main": "src/index.js",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./utils": "./src/utils.js"
  },
  "dependencies": {}
}
