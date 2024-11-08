"use strict";

// Re-export all the named exports from case conversion modules using require
module.exports = {
  ...require("camel-case"),
  ...require("capital-case"),
  ...require("constant-case"),
  ...require("dot-case"),
  ...require("header-case"),
  ...require("no-case"),
  ...require("param-case"),
  ...require("pascal-case"),
  ...require("path-case"),
  ...require("sentence-case"),
  ...require("snake-case")
};
