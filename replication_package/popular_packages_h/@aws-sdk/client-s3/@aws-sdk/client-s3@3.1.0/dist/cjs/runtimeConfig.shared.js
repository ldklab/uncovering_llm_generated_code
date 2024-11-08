"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSharedValues = void 0;
const endpoints_1 = require("./endpoints");
/**
 * @internal
 */
exports.ClientSharedValues = {
    apiVersion: "2006-03-01",
    disableHostPrefix: false,
    logger: {},
    regionInfoProvider: endpoints_1.defaultRegionInfoProvider,
    serviceId: "S3",
    signingEscapePath: false,
    useArnRegion: false,
};
//# sourceMappingURL=runtimeConfig.shared.js.map