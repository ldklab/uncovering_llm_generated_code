"use strict";

import { declare } from "@babel/helper-plugin-utils";

const dynamicImportSyntaxPlugin = declare(api => {
  api.assertVersion(7);
  
  return {
    name: "syntax-dynamic-import",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("dynamicImport");
    }
  };
});

export default dynamicImportSyntaxPlugin;
