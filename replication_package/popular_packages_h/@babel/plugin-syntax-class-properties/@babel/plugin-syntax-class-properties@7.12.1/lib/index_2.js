"use strict";

import { declare } from "@babel/helper-plugin-utils";

const syntaxClassPropertiesPlugin = declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-class-properties",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("classProperties", "classPrivateProperties", "classPrivateMethods");
    }
  };
});

export default syntaxClassPropertiesPlugin;
