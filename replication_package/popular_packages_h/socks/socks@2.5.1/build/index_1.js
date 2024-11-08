"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const socksclient = require("./client/socksclient");

for (const key in socksclient) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(socksclient, key)) {
        Object.defineProperty(exports, key, { enumerable: true, get: function () { return socksclient[key]; } });
    }
}
//# sourceMappingURL=index.js.map
