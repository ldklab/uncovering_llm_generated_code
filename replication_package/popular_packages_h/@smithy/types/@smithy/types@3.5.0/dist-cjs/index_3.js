// Utility functions
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty.call;

const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportProperties = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportProperties(srcExports, {
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
module.exports = toCommonJS(srcExports);

// src/auth/auth.ts
const HttpAuthLocation = ((HttpAuthLocation => {
  HttpAuthLocation["HEADER"] = "header";
  HttpAuthLocation["QUERY"] = "query";
  return HttpAuthLocation;
})({}));

// src/auth/HttpApiKeyAuth.ts
const HttpApiKeyAuthLocation = ((HttpApiKeyAuthLocation => {
  HttpApiKeyAuthLocation["HEADER"] = "header";
  HttpApiKeyAuthLocation["QUERY"] = "query";
  return HttpApiKeyAuthLocation;
})({}));

// src/endpoint.ts
const EndpointURLScheme = ((EndpointURLScheme => {
  EndpointURLScheme["HTTP"] = "http";
  EndpointURLScheme["HTTPS"] = "https";
  return EndpointURLScheme;
})({}));

// src/extensions/checksum.ts
const AlgorithmId = ((AlgorithmId => {
  AlgorithmId["MD5"] = "md5";
  AlgorithmId["CRC32"] = "crc32";
  AlgorithmId["CRC32C"] = "crc32c";
  AlgorithmId["SHA1"] = "sha1";
  AlgorithmId["SHA256"] = "sha256";
  return AlgorithmId;
})({}));

const getChecksumConfiguration = setName((runtimeConfig) => {
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

const resolveChecksumRuntimeConfig = setName((clientConfig) => {
  const runtimeConfig = {};
  clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
    runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
  });
  return runtimeConfig;
}, "resolveChecksumRuntimeConfig");

// src/extensions/defaultClientConfiguration.ts
const getDefaultClientConfiguration = setName((runtimeConfig) => {
  return {
    ...getChecksumConfiguration(runtimeConfig)
  };
}, "getDefaultClientConfiguration");

const resolveDefaultRuntimeConfig = setName((config) => {
  return {
    ...resolveChecksumRuntimeConfig(config)
  };
}, "resolveDefaultRuntimeConfig");

// src/http.ts
const FieldPosition = ((FieldPosition => {
  FieldPosition[FieldPosition["HEADER"] = 0] = "HEADER";
  FieldPosition[FieldPosition["TRAILER"] = 1] = "TRAILER";
  return FieldPosition;
})({}));

// src/middleware.ts
const SMITHY_CONTEXT_KEY = "__smithy_context";

// src/profile.ts
const IniSectionType = ((IniSectionType => {
  IniSectionType["PROFILE"] = "profile";
  IniSectionType["SSO_SESSION"] = "sso-session";
  IniSectionType["SERVICES"] = "services";
  return IniSectionType;
})({}));

// src/transfer.ts
const RequestHandlerProtocol = ((RequestHandlerProtocol => {
  RequestHandlerProtocol["HTTP_0_9"] = "http/0.9";
  RequestHandlerProtocol["HTTP_1_0"] = "http/1.0";
  RequestHandlerProtocol["TDS_8_0"] = "tds/8.0";
  return RequestHandlerProtocol;
})({}));

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
