"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSharedValues = void 0;
const endpoints_1 = require("./endpoints");
/**
 * @internal
 */
exports.ClientSharedValues = {
    apiVersion: "2019-06-10",
    disableHostPrefix: false,
    logger: {},
    regionInfoProvider: endpoints_1.defaultRegionInfoProvider,
    serviceId: "SSO OIDC",
};
//# sourceMappingURL=runtimeConfig.shared.js.map