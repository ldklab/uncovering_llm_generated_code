"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var loggerMiddleware = require("./loggerMiddleware");
Object.keys(loggerMiddleware).forEach(function(key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return loggerMiddleware[key];
    }
  });
});
