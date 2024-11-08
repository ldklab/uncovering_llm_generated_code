// src/index.js
import { resolve as pathResolve, join as pathJoin, dirname as pathDirname, basename as pathBasename, extname as pathExtname } from 'path';

// Function to normalize paths to use forward slashes for consistency
const normalize = p => p.replace(/\\/g, '/');

// Exported path functions with normalization
export const resolve = (...paths) => normalize(pathResolve(...paths));
export const join = (...paths) => normalize(pathJoin(...paths));
export const dirname = p => normalize(pathDirname(p));
export const basename = (p, ext) => pathBasename(normalize(p), ext);
export const extname = p => pathExtname(normalize(p));

// src/utils.js
export const filename = (p) => {
  const base = basename(p);
  const ext = extname(p);
  return base.slice(0, base.length - ext.length);
};

export const normalizeAliases = (aliases) => {
  return Object.fromEntries(
    Object.entries(aliases).map(([key, value]) => [normalize(key), normalize(value)])
  );
};

export const resolveAlias = (p, aliases) => {
  const normalizedAliases = normalizeAliases(aliases);
  return Object.keys(normalizedAliases).reduce((resolvedPath, alias) => {
    if (resolvedPath.startsWith(alias)) {
      return resolvedPath.replace(alias, normalizedAliases[alias]);
    }
    return resolvedPath;
  }, p);
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
