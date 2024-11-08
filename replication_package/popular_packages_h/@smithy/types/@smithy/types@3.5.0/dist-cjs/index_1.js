const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const __export = (target, all) => {
  for (const name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
const src_exports = {};
__export(src_exports, {
  AlgorithmId: () => AlgorithmId,
  EndpointURLScheme: () => EndpointURLScheme,
  FieldPosition: () => FieldPosition,
  HttpApiKeyAuthLocation: () => HttpApiKeyAuthLocation,
  HttpAuthLocation: () => HttpAuthLocation,
  IniSectionType: () => IniSectionType,
  RequestHandlerProtocol: () => RequestHandlerProtocol,
  SMITHY_CONTEXT_KEY: () => SMITHY_CONTEXT_KEY,
  getDefaultClientConfiguration: () => getDefaultClientConfiguration,
  resolveDefaultRuntimeConfig: () => resolveDefaultRuntimeConfig
});
module.exports = __toCommonJS(src_exports);

// src/auth/auth.ts
const HttpAuthLocation = ((HttpAuthLocation2) => {
  HttpAuthLocation2["HEADER"] = "header";
  HttpAuthLocation2["QUERY"] = "query";
  return HttpAuthLocation2;
})(HttpAuthLocation || {});

// src/auth/HttpApiKeyAuth.ts
const HttpApiKeyAuthLocation = ((HttpApiKeyAuthLocation2) => {
  HttpApiKeyAuthLocation2["HEADER"] = "header";
  HttpApiKeyAuthLocation2["QUERY"] = "query";
  return HttpApiKeyAuthLocation2;
})(HttpApiKeyAuthLocation || {});

// src/endpoint.ts
const EndpointURLScheme = ((EndpointURLScheme2) => {
  EndpointURLScheme2["HTTP"] = "http";
  EndpointURLScheme2["HTTPS"] = "https";
  return EndpointURLScheme2;
})(EndpointURLScheme || {});

// src/extensions/checksum.ts
const AlgorithmId = ((AlgorithmId2) => {
  AlgorithmId2["MD5"] = "md5";
  AlgorithmId2["CRC32"] = "crc32";
  AlgorithmId2["CRC32C"] = "crc32c";
  AlgorithmId2["SHA1"] = "sha1";
  AlgorithmId2["SHA256"] = "sha256";
  return AlgorithmId2;
})(AlgorithmId || {});
const getChecksumConfiguration = __name((runtimeConfig) => {
  const checksumAlgorithms = [];
  if (runtimeConfig.sha256 !== undefined) {
    checksumAlgorithms.push({
      algorithmId: () => "sha256" /* SHA256 */,
      checksumConstructor: () => runtimeConfig.sha256
    });
  }
  if (runtimeConfig.md5 !== undefined) {
    checksumAlgorithms.push({
      algorithmId: () => "md5" /* MD5 */,
      checksumConstructor: () => runtimeConfig.md5
    });
  }
  return {
    _checksumAlgorithms: checksumAlgorithms,
    addChecksumAlgorithm(algo) {
      this._checksumAlgorithms.push(algo);
    },
    checksumAlgorithms() {
      return this._checksumAlgorithms;
    }
  };
}, "getChecksumConfiguration");
const resolveChecksumRuntimeConfig = __name((clientConfig) => {
  const runtimeConfig = {};
  clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
    runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
  });
  return runtimeConfig;
}, "resolveChecksumRuntimeConfig");

// src/extensions/defaultClientConfiguration.ts
const getDefaultClientConfiguration = __name((runtimeConfig) => {
  return {
    ...getChecksumConfiguration(runtimeConfig)
  };
}, "getDefaultClientConfiguration");
const resolveDefaultRuntimeConfig = __name((config) => {
  return {
    ...resolveChecksumRuntimeConfig(config)
  };
}, "resolveDefaultRuntimeConfig");

// src/http.ts
const FieldPosition = ((FieldPosition2) => {
  FieldPosition2[FieldPosition2["HEADER"] = 0] = "HEADER";
  FieldPosition2[FieldPosition2["TRAILER"] = 1] = "TRAILER";
  return FieldPosition2;
})(FieldPosition || {});

// src/middleware.ts
const SMITHY_CONTEXT_KEY = "__smithy_context";

// src/profile.ts
const IniSectionType = ((IniSectionType2) => {
  IniSectionType2["PROFILE"] = "profile";
  IniSectionType2["SSO_SESSION"] = "sso-session";
  IniSectionType2["SERVICES"] = "services";
  return IniSectionType2;
})(IniSectionType || {});

// src/transfer.ts
const RequestHandlerProtocol = ((RequestHandlerProtocol2) => {
  RequestHandlerProtocol2["HTTP_0_9"] = "http/0.9";
  RequestHandlerProtocol2["HTTP_1_0"] = "http/1.0";
  RequestHandlerProtocol2["TDS_8_0"] = "tds/8.0";
  return RequestHandlerProtocol2;
})(RequestHandlerProtocol || {});
// Annotate the CommonJS export names for ESM import in node:

0 && (module.exports = {
  HttpAuthLocation,
  HttpApiKeyAuthLocation,
  EndpointURLScheme,
  AlgorithmId,
  getDefaultClientConfiguration,
  resolveDefaultRuntimeConfig,
  FieldPosition,
  SMITHY_CONTEXT_KEY,
  IniSectionType,
  RequestHandlerProtocol
});
