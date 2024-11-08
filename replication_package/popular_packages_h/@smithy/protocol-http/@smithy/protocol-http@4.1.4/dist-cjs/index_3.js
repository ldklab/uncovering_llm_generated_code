const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportItems = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};
const copyProps = (to, from, except) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: getOwnPropertyDescriptor(from, key)?.enumerable });
      }
    }
  }
  return to;
};
const toCommonJS = (mod) => copyProps(defineProperty({}, "__esModule", { value: true }), mod);

const src_exports = {};
exportItems(src_exports, {
  Field,
  Fields,
  HttpRequest,
  HttpResponse,
  getHttpHandlerExtensionConfiguration,
  isValidHostname,
  resolveHttpHandlerRuntimeConfig
});
module.exports = toCommonJS(src_exports);

function getHttpHandlerExtensionConfiguration(runtimeConfig) {
  setName(getHttpHandlerExtensionConfiguration, "getHttpHandlerExtensionConfiguration");
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
}

function resolveHttpHandlerRuntimeConfig(httpHandlerExtensionConfiguration) {
  setName(resolveHttpHandlerRuntimeConfig, "resolveHttpHandlerRuntimeConfig");
  return {
    httpHandler: httpHandlerExtensionConfiguration.httpHandler()
  };
}

const { FieldPosition } = require("@smithy/types");

class Field {
  constructor({ name, kind = FieldPosition.HEADER, values = [] }) {
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

setName(Field, "Field");

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

setName(Fields, "Fields");

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
      headers: { ...request.headers }
    });
    if (cloned.query) {
      cloned.query = cloneQuery(cloned.query);
    }
    return cloned;
  }

  static isInstance(request) {
    if (!request) return false;
    const req = request;
    return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req.query === "object" && typeof req.headers === "object";
  }
  
  clone() {
    return HttpRequest.clone(this);
  }
}

setName(HttpRequest, "HttpRequest");

function cloneQuery(query) {
  return Object.keys(query).reduce((carry, paramName) => {
    const param = query[paramName];
    return {
      ...carry,
      [paramName]: Array.isArray(param) ? [...param] : param
    };
  }, {});
}

setName(cloneQuery, "cloneQuery");

class HttpResponse {
  constructor(options) {
    this.statusCode = options.statusCode;
    this.reason = options.reason;
    this.headers = options.headers || {};
    this.body = options.body;
  }

  static isInstance(response) {
    if (!response) return false;
    const resp = response;
    return typeof resp.statusCode === "number" && typeof resp.headers === "object";
  }
}

setName(HttpResponse, "HttpResponse");

function isValidHostname(hostname) {
  const hostPattern = /^[a-z0-9][a-z0-9\.\-]*[a-z0-9]$/;
  return hostPattern.test(hostname);
}

setName(isValidHostname, "isValidHostname");

0 && (module.exports = {
  getHttpHandlerExtensionConfiguration,
  resolveHttpHandlerRuntimeConfig,
  Field,
  Fields,
  HttpRequest,
  HttpResponse,
  isValidHostname
});
