"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const socksClientModule = require("./client/socksclient");

Object.keys(socksClientModule).forEach((key) => {
    if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
        Object.defineProperty(exports, key, {
            enumerable: true,
            get: function () {
                return socksClientModule[key];
            }
        });
    }
});

//# sourceMappingURL=index.js.map
