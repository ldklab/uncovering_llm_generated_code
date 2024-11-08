// Utility Functions
const defineProperty = Object.defineProperty;
const getOwnPropDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

const assignName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportAll = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropNames(from)) {
      if (!hasOwnProp.call(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = getOwnPropDescriptor(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Enum-like Definitions
const HttpAuthLocation = ((HttpAuthLocation2) => {
  HttpAuthLocation2["HEADER"] = "header";
  HttpAuthLocation2["QUERY"] = "query";
  return HttpAuthLocation2;
})({});

const HttpApiKeyAuthLocation = ((HttpApiKeyAuthLocation2) => {
  HttpApiKeyAuthLocation2["HEADER"] = "header";
  HttpApiKeyAuthLocation2["QUERY"] = "query";
  return HttpApiKeyAuthLocation2;
})({});

const EndpointURLScheme = ((EndpointURLScheme2) => {
  EndpointURLScheme2["HTTP"] = "http";
  EndpointURLScheme2["HTTPS"] = "https";
  return EndpointURLScheme2;
})({});

const AlgorithmId = ((AlgorithmId2) => {
  AlgorithmId2["MD5"] = "md5";
  AlgorithmId2["CRC32"] = "crc32";
  AlgorithmId2["CRC32C"] = "crc32c";
  AlgorithmId2["SHA1"] = "sha1";
  AlgorithmId2["SHA256"] = "sha256";
  return AlgorithmId2;
})({});

const FieldPosition = ((FieldPosition2) => {
  FieldPosition2[FieldPosition2["HEADER"] = 0] = "HEADER";
  FieldPosition2[FieldPosition2["TRAILER"] = 1] = "TRAILER";
  return FieldPosition2;
})({});

const IniSectionType = ((IniSectionType2) => {
  IniSectionType2["PROFILE"] = "profile";
  IniSectionType2["SSO_SESSION"] = "sso-session";
  IniSectionType2["SERVICES"] = "services";
  return IniSectionType2;
})({});

const RequestHandlerProtocol = ((RequestHandlerProtocol2) => {
  RequestHandlerProtocol2["HTTP_0_9"] = "http/0.9";
  RequestHandlerProtocol2["HTTP_1_0"] = "http/1.0";
  RequestHandlerProtocol2["TDS_8_0"] = "tds/8.0";
  return RequestHandlerProtocol2;
})({});

// Configuration and Checksum Functions
const getChecksumConfiguration = assignName((runtimeConfig) => {
  const checksumAlgorithms = [];
  if (runtimeConfig.sha256 !== undefined) {
    checksumAlgorithms.push({
      algorithmId: () => "sha256",
      checksumConstructor: () => runtimeConfig.sha256
    });
  }
  if (runtimeConfig.md5 !== undefined) {
    checksumAlgorithms.push({
      algorithmId: () => "md5",
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

const resolveChecksumRuntimeConfig = assignName((clientConfig) => {
  const runtimeConfig = {};
  clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
    runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
  });
  return runtimeConfig;
}, "resolveChecksumRuntimeConfig");

const getDefaultClientConfiguration = assignName((runtimeConfig) => ({
  ...getChecksumConfiguration(runtimeConfig)
}), "getDefaultClientConfiguration");

const resolveDefaultRuntimeConfig = assignName((config) => ({
  ...resolveChecksumRuntimeConfig(config)
}), "resolveDefaultRuntimeConfig");

// Module Export
const src_exports = {};
exportAll(src_exports, {
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

module.exports = toCommonJS(src_exports);
