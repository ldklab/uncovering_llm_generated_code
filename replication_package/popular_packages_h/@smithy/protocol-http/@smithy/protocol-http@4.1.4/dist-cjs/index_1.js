// Utility Functions
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const nameProperty = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportModule = (target, exports) => {
  for (const name in exports) {
    defineProperty(target, name, { get: exports[name], enumerable: true });
  }
};

const copyProps = (to, from, except) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        const desc = getOwnPropertyDescriptor(from, key);
        defineProperty(to, key, { get: () => from[key], enumerable: desc ? desc.enumerable : true });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProps(defineProperty({}, "__esModule", { value: true }), mod);

// HTTP Handler Configuration
const getHttpHandlerExtensionConfiguration = nameProperty((runtimeConfig) => {
  let httpHandler = runtimeConfig.httpHandler;
  return {
    setHttpHandler: (handler) => { httpHandler = handler; },
    httpHandler: () => httpHandler,
    updateHttpClientConfig: (key, value) => { httpHandler.updateHttpClientConfig(key, value); },
    httpHandlerConfigs: () => httpHandler.httpHandlerConfigs()
  };
}, "getHttpHandlerExtensionConfiguration");

const resolveHttpHandlerRuntimeConfig = nameProperty((httpHandlerExtensionConfiguration) => ({
  httpHandler: httpHandlerExtensionConfiguration.httpHandler()
}), "resolveHttpHandlerRuntimeConfig");

// Field Class
class Field {
  constructor({ name, kind = "HEADER", values = [] }) {
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
    this.values = this.values.filter(v => v !== value);
  }

  toString() {
    return this.values.map(v => (v.includes(",") || v.includes(" ") ? `"${v}"` : v)).join(", ");
  }

  get() {
    return this.values;
  }
}
nameProperty(Field, "Field");

// Fields Class
class Fields {
  constructor({ fields = [], encoding = "utf-8" }) {
    this.entries = {};
    this.encoding = encoding;
    fields.forEach(field => this.setField(field));
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
    return Object.values(this.entries).filter(field => field.kind === kind);
  }
}
nameProperty(Fields, "Fields");

// HttpRequest Class
class HttpRequest {
  constructor(options) {
    this.method = options.method || "GET";
    this.hostname = options.hostname || "localhost";
    this.port = options.port;
    this.query = options.query || {};
    this.headers = options.headers || {};
    this.body = options.body;
    this.protocol = options.protocol ? (options.protocol.endsWith(':') ? options.protocol : `${options.protocol}:`) : "https:";
    this.path = options.path ? (options.path.startsWith('/') ? options.path : `/${options.path}`) : "/";
    this.username = options.username;
    this.password = options.password;
    this.fragment = options.fragment;
  }

  static clone(request) {
    const cloned = new HttpRequest({ ...request, headers: { ...request.headers } });
    if (cloned.query) cloned.query = cloneQuery(cloned.query);
    return cloned;
  }

  static isInstance(request) {
    if (!request) return false;
    return ["method", "protocol", "hostname", "path"].every(prop => prop in request) && 
           typeof request.query === "object" && typeof request.headers === "object";
  }

  clone() {
    return HttpRequest.clone(this);
  }
}
nameProperty(HttpRequest, "HttpRequest");

const cloneQuery = (query) => Object.fromEntries(Object.entries(query).map(
  ([key, value]) => [key, Array.isArray(value) ? [...value] : value]
));

// HttpResponse Class
class HttpResponse {
  constructor(options) {
    this.statusCode = options.statusCode;
    this.reason = options.reason;
    this.headers = options.headers || {};
    this.body = options.body;
  }

  static isInstance(response) {
    return response && typeof response.statusCode === "number" && typeof response.headers === "object";
  }
}
nameProperty(HttpResponse, "HttpResponse");

// Valid Hostname Checker
const isValidHostname = (hostname) => /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(hostname);
nameProperty(isValidHostname, "isValidHostname");

// Export everything
const exports = {
  Field,
  Fields,
  HttpRequest,
  HttpResponse,
  getHttpHandlerExtensionConfiguration,
  resolveHttpHandlerRuntimeConfig,
  isValidHostname
};

module.exports = toCommonJS(exports);
