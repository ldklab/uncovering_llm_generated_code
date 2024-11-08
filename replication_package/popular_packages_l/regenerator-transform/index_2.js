const { transformSync } = require("@babel/core");
const regenerator = require("regenerator");

// A custom Babel plugin for transforming async functions and generators
function regeneratorTransformPlugin(api, options = {}) {
  api.assertVersion(7);

  // Set default transformation options
  const { asyncGenerators = true, generators = true, async = true } = options;

  return {
    visitor: {
      Function(path) {
        // Conditionally transform async functions
        if (path.node.async && async) regenerator.async(path.node, api);
        
        // Conditionally transform generators
        if (path.node.generator) {
          if (path.node.async && asyncGenerators) {
            regenerator.asyncGenerator(path.node, api);
          } else if (generators) {
            regenerator.generator(path.node, api);
          }
        }
      }
    }
  };
}

// Exporting as a module for use by Babel
module.exports = function (api) {
  return regeneratorTransformPlugin(api, {
    asyncGenerators: true,
    generators: true,
    async: true
  });
};

// Example CLI usage: process file and output transformed code
if (require.main === module) {
  const fs = require("fs");
  const path = process.argv[2];
  const code = fs.readFileSync(path, "utf8");

  // Apply transformation using the custom plugin
  const output = transformSync(code, {
    plugins: [module.exports]
  });

  console.log(output.code);
}
