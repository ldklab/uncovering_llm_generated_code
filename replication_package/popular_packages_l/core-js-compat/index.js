markdown
# core-js-compat.js

const compatData = require('./compat-data.json'); // JSON file containing mock compatibility data
const entryPoints = require('./entry-points.json'); // JSON mapping entry points to module names
const moduleList = require('./modules-list.json'); // Array of all module names

function compat({ targets, modules = [], exclude = [], version = 'latest', inverse = false }) {
  const requiredModules = Object.keys(compatData).filter(module => {
    if (modules.length && !matchesFilter(module, modules)) return false;
    if (exclude.length && matchesFilter(module, exclude)) return false;
    const targetVersions = compatData[module];
    return Object.keys(targets).some(env => {
      const versionNeeded = targetVersions[env];
      return versionNeeded && targets[env] != null && compareVersions(versionNeeded, targets[env]) > 0;
    });
  });

  const result = inverse 
    ? moduleList.filter(module => !requiredModules.includes(module))
    : requiredModules;

  const targetsOutput = result.reduce((acc, module) => {
    acc[module] = compatData[module];
    return acc;
  }, {});

  return { list: result, targets: targetsOutput };
}

function matchesFilter(moduleName, filters) {
  return filters.some(filter => {
    if (typeof filter === 'string') return moduleName.startsWith(filter);
    if (filter instanceof RegExp) return filter.test(moduleName);
    return false;
  });
}

function compareVersions(v1, v2) {
  if (v1 === v2) return 0;
  const v1parts = v1.split('.').map(Number);
  const v2parts = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const diff = (v1parts[i] || 0) - (v2parts[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// Exported API
module.exports = {
  compat,
  data: compatData,
  entries: entryPoints,
  modules: moduleList,
  getModulesListForTargetVersion(version) {
    return moduleList; // Simplified; assumes all modules are available for the latest version
  },
};

// Mock JSON files
/* compat-data.json
{
  "es.error.cause": { "ios": "14.5" },
  "es.array.includes": { "firefox": "100" },
  // ...additional module compatibility data
}
*/

/* entry-points.json
{
  "core-js/actual": ["es.error.cause", "es.array.includes"],
  // ...
}
*/

/* modules-list.json
[
  "es.error.cause",
  "es.array.includes",
  // ...all modules
]
*/
