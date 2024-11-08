const lib = require("../dist/index.cjs");

const exportsObject = {
  ...lib.consola,  // Start off with consola properties
};

// Append any additional properties from lib
for (const key of Object.keys(lib)) {
  if (!exportsObject.hasOwnProperty(key)) {
    exportsObject[key] = lib[key];
  }
}

module.exports = exportsObject;
