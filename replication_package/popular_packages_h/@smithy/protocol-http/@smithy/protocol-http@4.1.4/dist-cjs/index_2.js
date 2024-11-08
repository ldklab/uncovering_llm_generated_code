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
  if (from && (typeof from === "object" || typeof from === "function")) {
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
  Field: () => Field,
  Fields: () => Fields,
  HttpRequest: () => HttpRequest,
  HttpResponse: () => HttpResponse,
  IHttpRequest: () => import_types.HttpRequest,
  getHttpHandlerExtensionConfiguration: () => getHttpHandlerExtensionConfiguration,
  isValidHostname: () => isValidHostname,
  resolveHttpHandlerRuntimeConfig: () => resolveHttpHandlerRuntimeConfig
});
module.exports = __toCommonJS(src_exports);

// src/extensions/httpExtensionConfiguration.ts
const getHttpHandlerExtensionConfiguration = /* @__PURE__ */ __name((runtimeConfig) => {
  let httpHandler = runtimeConfig.httpHandler;
  return {
    setHttpHandler(handler) {
      httpHandler = handler;
    },
    httpHandler() {
      return httpHandler;
    },
    updateHttpClientConfig(key, value) {
      httpHandler.updateHttpClientConfig(key, value);
    },
    httpHandlerConfigs() {
      return httpHandler.httpHandlerConfigs();
    }
  };
}, "getHttpHandlerExtensionConfiguration");

const resolveHttpHandlerRuntimeConfig = /* @__PURE__ */ __name((httpHandlerExtensionConfiguration) => {
  return {
    httpHandler: httpHandlerExtensionConfiguration.httpHandler()
  };
}, "resolveHttpHandlerRuntimeConfig");

// src/Field.ts
const import_types = require("@smithy/types");

class _Field {
  constructor({ name, kind = import_types.FieldPosition.HEADER, values = [] }) {
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
    return this.values.map((v) => v.includes(",") || v.includes(" ") ? `"${v}"` : v).join(", ");
  }

  get() {
    return this.values;
  }
}
__name(_Field, "Field");
const Field = _Field;

// src/Fields.ts
class _Fields {
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
__name(_Fields, "Fields");
const Fields = _Fields;

// src/httpRequest.ts
class _HttpRequest {
  constructor(options) {
    this.method = options.method || "GET";
    this.hostname = options.hostname || "localhost";
    this.port = options.port;
    this.query = options.query || {};
    this.headers = options.headers || {};
    this.body = options.body;
    this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
    this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
    this.username = options.username;
    this.password = options.password;
    this.fragment = options.fragment;
  }

  static clone(request) {
    const cloned = new _HttpRequest({
      ...request,
      headers: { ...request.headers }
    });
    if (cloned.query) {
      cloned.query = cloneQuery(cloned.query);
    }
    return cloned;
  }

  static isInstance(request) {
    if (!request) {
      return false;
    }
    const req = request;
    return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
  }

  clone() {
    return _HttpRequest.clone(this);
  }
}
__name(_HttpRequest, "HttpRequest");
const HttpRequest = _HttpRequest;

function cloneQuery(query) {
  return Object.keys(query).reduce((carry, paramName) => {
    const param = query[paramName];
    return {
      ...carry,
      [paramName]: Array.isArray(param) ? [...param] : param
    };
  }, {});
}
__name(cloneQuery, "cloneQuery");

// src/httpResponse.ts
class _HttpResponse {
  constructor(options) {
    this.statusCode = options.statusCode;
    this.reason = options.reason;
    this.headers = options.headers || {};
    this.body = options.body;
  }

  static isInstance(response) {
    if (!response)
      return false;
    const resp = response;
    return typeof resp.statusCode === "number" && typeof resp.headers === "object";
  }
}
__name(_HttpResponse, "HttpResponse");
const HttpResponse = _HttpResponse;

// src/isValidHostname.ts
function isValidHostname(hostname) {
  const hostPattern = /^[a-z0-9][a-z0-9\.\-]*[a-z0-9]$/;
  return hostPattern.test(hostname);
}
__name(isValidHostname, "isValidHostname");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getHttpHandlerExtensionConfiguration,
  resolveHttpHandlerRuntimeConfig,
  Field,
  Fields,
  HttpRequest,
  HttpResponse,
  isValidHostname
});
