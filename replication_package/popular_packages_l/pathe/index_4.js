// src/index.js
import path from 'path';

// Utility to ensure paths use forward slashes
const normalize = (filePath) => filePath.replace(/\\/g, '/');

// Functions to work with file paths, ensuring they are normalized
export const resolve = (...pathSegments) => normalize(path.resolve(...pathSegments));
export const join = (...pathSegments) => normalize(path.join(...pathSegments));
export const dirname = (filePath) => normalize(path.dirname(filePath));
export const basename = (filePath, extension) => path.basename(normalize(filePath), extension);
export const extname = (filePath) => path.extname(normalize(filePath));

// src/utils.js
export const filename = (filePath) => {
  const baseName = basename(filePath);
  return baseName.substr(0, baseName.length - extname(filePath).length);
};

export const normalizeAliases = (aliasMap) => {
  const normalizedAliases = {};
  for (const key in aliasMap) {
    normalizedAliases[normalize(key)] = normalize(aliasMap[key]);
  }
  return normalizedAliases;
};

export const resolveAlias = (filePath, aliasMap) => {
  const normalizedAliases = normalizeAliases(aliasMap);
  for (const alias in normalizedAliases) {
    if (filePath.startsWith(alias)) {
      return filePath.replace(alias, normalizedAliases[alias]);
    }
  }
  return filePath;
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
