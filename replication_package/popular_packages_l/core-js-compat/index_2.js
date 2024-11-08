// core-js-compat.js

const compatData = require('./compat-data.json'); // Compatibility data for modules by environment
const entryPoints = require('./entry-points.json'); // Maps entry points to module names
const moduleList = require('./modules-list.json'); // List of all module names

// Main functionality to determine required or excluded modules based on target environments
function compat({ targets, modules = [], exclude = [], version = 'latest', inverse = false }) {
  // Filter the modules that are required based on the specified target environments
  const requiredModules = Object.keys(compatData).filter(module => {
    if (modules.length && !matchesFilter(module, modules)) return false; // Check against specified modules
    if (exclude.length && matchesFilter(module, exclude)) return false; // Check against excluded modules
    const targetVersions = compatData[module]; // Get versions for the current module from compat data
    return Object.keys(targets).some(env => { // Check if any of the target environments need this module
      const versionNeeded = targetVersions[env]; // Required version for current environment
      return versionNeeded && targets[env] != null && compareVersions(versionNeeded, targets[env]) > 0;
    });
  });

  // Determine the result based on the inverse flag - either required modules or those not required
  const result = inverse 
    ? moduleList.filter(module => !requiredModules.includes(module))
    : requiredModules;

  // Collate the target versions for each result module
  const targetsOutput = result.reduce((acc, module) => {
    acc[module] = compatData[module];
    return acc;
  }, {});

  // Return both the list of relevant modules and their target compatibility versions
  return { list: result, targets: targetsOutput };
}

// Check if a module name matches any filter conditions (strings or regexes)
function matchesFilter(moduleName, filters) {
  return filters.some(filter => {
    if (typeof filter === 'string') return moduleName.startsWith(filter);
    if (filter instanceof RegExp) return filter.test(moduleName);
    return false;
  });
}

// Compare two version strings, return positive if v1 > v2, negative if v1 < v2, or zero if equal
function compareVersions(v1, v2) {
  if (v1 === v2) return 0; // Equal versions
  const v1parts = v1.split('.').map(Number); // Split into parts for comparison
  const v2parts = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const diff = (v1parts[i] || 0) - (v2parts[i] || 0); // Compare each part
    if (diff !== 0) return diff;
  }
  return 0; // Return zero if all parts are equal
}

// Exported API with compatibility function and mock data
module.exports = {
  compat,
  data: compatData,
  entries: entryPoints,
  modules: moduleList,
  getModulesListForTargetVersion(version) {
    return moduleList; // Return all modules for the specified version
  },
};

// Example JSON structure
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
