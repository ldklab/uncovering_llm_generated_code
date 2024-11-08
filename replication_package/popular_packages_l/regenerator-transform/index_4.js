const { transformSync } = require("@babel/core");
const regenerator = require("regenerator"); // Regenerator is used to transform generator and async functions

// Define the regenerator transformation plugin for Babel
function regeneratorTransformPlugin(api, options = {}) {
  api.assertVersion(7); // Ensures Babel's version compatibility

  // Destructure options with default values
  const {
    asyncGenerators = true,
    generators = true,
    async = true
  } = options;

  // Return a visitor object used by Babel when traversing the AST
  return {
    visitor: {
      Function(path) {
        // Transform async functions if enabled
        if (path.node.async && async) regenerator.async(path.node, api);

        // Transform generator functions according to settings
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

// Export a function that returns the plugin with default transformation settings
module.exports = function (api) {
  return regeneratorTransformPlugin(api, {
    asyncGenerators: true,
    generators: true,
    async: true
  });
};

// Check if the script is called from CLI and process the input file accordingly
if (require.main === module) {
  const fs = require("fs");  // File system module to read files
  const path = process.argv[2];  // Get filepath from command line arguments
  const code = fs.readFileSync(path, "utf8");  // Read file content

  // Transform the file content using the plugin
  const output = transformSync(code, {
    plugins: [module.exports]
  });

  // Print the transpiled code
  console.log(output.code);
}
