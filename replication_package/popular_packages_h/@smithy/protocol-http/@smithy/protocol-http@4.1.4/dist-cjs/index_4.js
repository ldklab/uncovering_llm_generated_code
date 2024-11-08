// Helper functions for defining object properties
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Helper function to name functions
const nameFunction = (target, value) => defineProperty(target, "name", { value, configurable: true });

// Export functions
const exportModule = (target, all) => {
  for (let name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

// Copy properties between objects
const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};

// Convert to CommonJS
const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Import types
const importTypes = require("@smithy/types");

// src/index.ts - Main module exports
const mainExports = {};
exportModule(mainExports, {
  Field,
  Fields,
  HttpRequest,
  HttpResponse,
  IHttpRequest: () => importTypes.HttpRequest,
  getHttpHandlerExtensionConfiguration,
  isValidHostname,
  resolveHttpHandlerRuntimeConfig,
});
module.exports = toCommonJS(mainExports);

// src/extensions/httpExtensionConfiguration.ts
const getHttpHandlerExtensionConfiguration = nameFunction((runtimeConfig) => {
  let httpHandler = runtimeConfig.httpHandler;
  return {
    setHttpHandler(handler) {
      httpHandler = handler;
    },
    httpHandler: () => httpHandler,
    updateHttpClientConfig(key, value) {
      httpHandler.updateHttpClientConfig(key, value);
    },
    httpHandlerConfigs: () => httpHandler.httpHandlerConfigs(),
  };
}, "getHttpHandlerExtensionConfiguration");

const resolveHttpHandlerRuntimeConfig = nameFunction((httpHandlerExtensionConfiguration) => {
  return {
    httpHandler: httpHandlerExtensionConfiguration.httpHandler(),
  };
}, "resolveHttpHandlerRuntimeConfig");

// src/Field.ts
class Field {
  constructor({ name, kind = importTypes.FieldPosition.HEADER, values = [] }) {
    this.name = name;
    this.kind = kind;
    this.values = values;
  }

  add(value) {
    this.values.push(value);
  }

  set(values) {
    this.values = values;
  }

  remove(value) {
    this.values = this.values.filter((v) => v !== value);
  }

  toString() {
    return this.values.map((v) => (v.includes(",") || v.includes(" ") ? `"${v}"` : v)).join(", ");
  }

  get() {
    return this.values;
  }
}

// src/Fields.ts
class Fields {
  constructor({ fields = [], encoding = "utf-8" }) {
    this.entries = {};
    fields.forEach(this.setField.bind(this));
    this.encoding = encoding;
  }

  setField(field) {
    this.entries[field.name.toLowerCase()] = field;
  }

  getField(name) {
    return this.entries[name.toLowerCase()];
  }

  removeField(name) {
    delete this.entries[name.toLowerCase()];
  }

  getByType(kind) {
    return Object.values(this.entries).filter((field) => field.kind === kind);
  }
}

// src/httpRequest.ts
class HttpRequest {
  constructor(options) {
    this.method = options.method || "GET";
    this.hostname = options.hostname || "localhost";
    this.port = options.port;
    this.query = options.query || {};
    this.headers = options.headers || {};
    this.body = options.body;
    this.protocol = options.protocol ? (options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol) : "https:";
    this.path = options.path ? (options.path.charAt(0) !== "/" ? `/${options.path}` : options.path) : "/";
    this.username = options.username;
    this.password = options.password;
    this.fragment = options.fragment;
  }

  static clone(request) {
    const cloned = new HttpRequest({
      ...request,
      headers: { ...request.headers },
    });
    if (cloned.query) {
      cloned.query = cloneQuery(cloned.query);
    }
    return cloned;
  }

  static isInstance(request) {
    if (!request) return false;
    return "method" in request && "protocol" in request && "hostname" in request && "path" in request && typeof request["query"] === "object" && typeof request["headers"] === "object";
  }

  clone() {
    return HttpRequest.clone(this);
  }
}

function cloneQuery(query) {
  return Object.keys(query).reduce((carry, paramName) => {
    const param = query[paramName];
    return {
      ...carry,
      [paramName]: Array.isArray(param) ? [...param] : param,
    };
  }, {});
}

// src/httpResponse.ts
class HttpResponse {
  constructor(options) {
    this.statusCode = options.statusCode;
    this.reason = options.reason;
    this.headers = options.headers || {};
    this.body = options.body;
  }

  static isInstance(response) {
    if (!response) return false;
    return typeof response.statusCode === "number" && typeof response.headers === "object";
  }
}

// src/isValidHostname.ts
function isValidHostname(hostname) {
  const hostPattern = /^[a-z0-9][a-z0-9\.\-]*[a-z0-9]$/;
  return hostPattern.test(hostname);
}
