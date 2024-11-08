const lib = require("../dist/index.cjs");

const mainExport = lib.consola;
const additionalExports = {};

for (const key in lib) {
  if (!(key in mainExport)) {
    additionalExports[key] = lib[key];
  }
}

module.exports = {
  ...{ consola: mainExport },
  ...additionalExports
};
