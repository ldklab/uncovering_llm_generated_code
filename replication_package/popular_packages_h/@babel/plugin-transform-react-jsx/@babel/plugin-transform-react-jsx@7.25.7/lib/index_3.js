"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const { default: createPlugin } = require("./create-plugin.js");

const pluginConfig = createPlugin({
  name: "transform-react-jsx",
  development: false
});

exports.default = pluginConfig;

//# sourceMappingURL=index.js.map
