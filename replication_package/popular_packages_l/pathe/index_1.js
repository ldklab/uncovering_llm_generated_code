// src/index.js
import path from 'path';

// Normalize a path to use forward slashes
const normalize = (p) => p.replace(/\\/g, '/');

// Example implementation of some path functions
export const resolve = (...paths) => normalize(path.resolve(...paths));
export const join = (...paths) => normalize(path.join(...paths));
export const dirname = (p) => normalize(path.dirname(p));
export const basename = (p, ext) => path.basename(normalize(p), ext);
export const extname = (p) => path.extname(normalize(p));

// src/utils.js
export const filename = (p) => {
  const base = basename(p);
  return base.substring(0, base.length - extname(p).length);
};

export const normalizeAliases = (aliases) => {
  const normalized = {};
  for (const alias in aliases) {
    normalized[normalize(alias)] = normalize(aliases[alias]);
  }
  return normalized;
};

export const resolveAlias = (p, aliases) => {
  const normalizedAliases = normalizeAliases(aliases);
  for (const [alias, replacement] of Object.entries(normalizedAliases)) {
    if (p.startsWith(alias)) {
      return p.replace(alias, replacement);
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
