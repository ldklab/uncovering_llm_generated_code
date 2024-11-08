"use strict";

import createPlugin from "./create-plugin.js";

const pluginConfig = createPlugin({
  name: "transform-react-jsx",
  development: false
});

export default pluginConfig;
