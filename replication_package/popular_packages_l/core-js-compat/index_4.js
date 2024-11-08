// core-js-compat.js

const compatData = require('./compat-data.json'); // JSON file containing compatibility data
const entryPoints = require('./entry-points.json'); // JSON mapping entry points to module names
const moduleList = require('./modules-list.json'); // Array of all module names

/**
 * Determine the compatibility of modules given target environments and filters.
 *
 * @param {Object} params - Parameters for compatibility check
 * @param {Object} params.targets - Target environments with versions
 * @param {Array} [params.modules=[]] - Modules to check (default is empty array)
 * @param {Array} [params.exclude=[]] - Modules to exclude from checking (default is empty array)
 * @param {string} [params.version='latest'] - Core-js version to check against
 * @param {boolean} [params.inverse=false] - Flag to inverse the result set
 * @returns {Object} - An object with list of required modules and their target versions
 */
function compat({ targets, modules = [], exclude = [], version = 'latest', inverse = false }) {
  // Determine which modules are required based on the targets, modules, and exclude filters
  const requiredModules = Object.keys(compatData).filter(moduleName => {
    if (modules.length && !matchesFilter(moduleName, modules)) return false;
    if (exclude.length && matchesFilter(moduleName, exclude)) return false;

    const targetVersions = compatData[moduleName];
    
    // Check if any target environment requires a module version higher than available
    return Object.keys(targets).some(env => {
      const versionNeeded = targetVersions[env];
      return versionNeeded && targets[env] != null && compareVersions(versionNeeded, targets[env]) > 0;
    });
  });

  // If inverse flag is set, include only the non-required modules
  const result = inverse 
    ? moduleList.filter(module => !requiredModules.includes(module))
    : requiredModules;

  // Build targets output for each required module
  const targetsOutput = result.reduce((acc, module) => {
    acc[module] = compatData[module];
    return acc;
  }, {});

  // Return the list of required modules and their target versions
  return { list: result, targets: targetsOutput };
}

/**
 * Check if a module name matches any filter from a given list.
 *
 * @param {string} moduleName - Name of the module
 * @param {Array} filters - List of filters (strings or regex)
 * @returns {boolean} - True if the module name matches any filter
 */
function matchesFilter(moduleName, filters) {
  return filters.some(filter => {
    if (typeof filter === 'string') return moduleName.startsWith(filter);
    if (filter instanceof RegExp) return filter.test(moduleName);
    return false;
  });
}

/**
 * Compare two version strings.
 *
 * @param {string} v1 - First version string
 * @param {string} v2 - Second version string
 * @returns {number} - 0 if equal, positive if v1 > v2, negative if v1 < v2
 */
function compareVersions(v1, v2) {
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

// JSON mock data examples (commented out for reference)
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
