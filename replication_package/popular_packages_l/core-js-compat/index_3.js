// core-js-compat.js

const compatData = require('./compat-data.json'); // Compatibility data for various modules and environments
const entryPoints = require('./entry-points.json'); // Entry points mapped to module names
const moduleList = require('./modules-list.json'); // List of all available modules

function compat({ targets, modules = [], exclude = [], version = 'latest', inverse = false }) {
  const requiredModules = Object.keys(compatData).filter(module => {
    if (modules.length && !matchesFilter(module, modules)) return false; // Filter modules
    if (exclude.length && matchesFilter(module, exclude)) return false; // Exclude certain modules
    const targetVersions = compatData[module];
    return Object.keys(targets).some(env => {
      const versionNeeded = targetVersions[env];
      return versionNeeded && targets[env] != null && compareVersions(versionNeeded, targets[env]) > 0; // Check if the target needs this module
    });
  });

  const result = inverse 
    ? moduleList.filter(module => !requiredModules.includes(module)) // Inverse selection if needed
    : requiredModules; // Regular selection

  const targetsOutput = result.reduce((acc, module) => {
    acc[module] = compatData[module]; // Gather compatibility data for the selected modules
    return acc;
  }, {});

  return { list: result, targets: targetsOutput }; // Return selected list and their target versions
}

function matchesFilter(moduleName, filters) { 
  return filters.some(filter => {
    if (typeof filter === 'string') return moduleName.startsWith(filter); // String-based filter
    if (filter instanceof RegExp) return filter.test(moduleName); // Regex-based filter
    return false;
  });
}

function compareVersions(v1, v2) {
  if (v1 === v2) return 0;
  const v1parts = v1.split('.').map(Number);
  const v2parts = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const diff = (v1parts[i] || 0) - (v2parts[i] || 0);
    if (diff !== 0) return diff; // Compare individual parts of the version number
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
    return moduleList; // Return full module list, simplifying for the latest version
  },
};

// Example JSON structures (for understanding)

/* compat-data.json
{
  "es.error.cause": { "ios": "14.5" },
  "es.array.includes": { "firefox": "100" }
}
*/

/* entry-points.json
{
  "core-js/actual": ["es.error.cause", "es.array.includes"]
}
*/

/* modules-list.json
[
  "es.error.cause",
  "es.array.includes"
]
*/
