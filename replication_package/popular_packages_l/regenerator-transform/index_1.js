const { transformSync } = require("@babel/core");
const regenerator = require("regenerator");

function regeneratorTransformPlugin(api, options = {}) {
  api.assertVersion(7);

  const { asyncGenerators = true, generators = true, async = true } = options;

  return {
    visitor: {
      Function(path) {
        if (path.node.async && async) regenerator.async(path.node, api);
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

module.exports = function (api) {
  return regeneratorTransformPlugin(api, {
    asyncGenerators: true,
    generators: true,
    async: true
  });
};

// CLI Usage Example
if (require.main === module) {
  const fs = require("fs");
  const path = process.argv[2];
  const code = fs.readFileSync(path, "utf8");

  const output = transformSync(code, {
    plugins: [module.exports]
  });

  console.log(output.code);
}
