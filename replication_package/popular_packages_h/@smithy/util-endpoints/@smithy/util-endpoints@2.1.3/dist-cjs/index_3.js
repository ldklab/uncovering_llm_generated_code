const defineProp = Object.defineProperty;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

const setName = (target, value) => defineProp(target, "name", { value, configurable: true });

const exportAll = (target, module) => {
  Object.keys(module).forEach(name => {
    defineProp(target, name, { get: module[name], enumerable: true });
  });
};

const copyProps = (to, from, except, desc) => {
  if (!from || !(typeof from === "object" || typeof from === "function")) return to;
  for (const key of getOwnPropNames(from)) {
    if (!hasOwnProp.call(to, key) && key !== except) {
      defineProp(to, key, {
        get: () => from[key],
        enumerable: !(desc = getOwnPropDesc(from, key)) || desc.enumerable
      });
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProps(defineProp({}, "__esModule", { value: true }), mod);

// src/index.ts
let moduleExports = {};

exportAll(moduleExports, {
  EndpointCache,
  EndpointError,
  customEndpointFunctions,
  isIpAddress,
  isValidHostLabel,
  resolveEndpoint
});

module.exports = toCommonJS(moduleExports);

// src/cache/EndpointCache.ts
class EndpointCache {
  constructor({ size, params }) {
    this.data = new Map();
    this.parameters = params || [];
    this.capacity = size || 50;
  }

  get(endpointParams, resolver) {
    const key = this.hash(endpointParams);
    if (key === false) return resolver();
    if (!this.data.has(key)) {
      if (this.data.size > this.capacity + 10) {
        const keys = this.data.keys();
        let i = 0;
        while (i <= 10) {
          const { value, done } = keys.next();
          this.data.delete(value);
          if (done) break;
          i++;
        }
      }
      this.data.set(key, resolver());
    }
    return this.data.get(key);
  }

  size() {
    return this.data.size;
  }

  hash(endpointParams) {
    if (this.parameters.length === 0) return false;

    return this.parameters.reduce((buffer, param) => {
      const val = String(endpointParams[param] ?? "");
      return val.includes("|;") ? false : buffer + val + "|;";
    }, "");
  }
}
setName(EndpointCache, "EndpointCache");

// src/lib/isIpAddress.ts
const IP_V4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;

const isIpAddress = setName(
  (value) => IP_V4_REGEX.test(value) || (value.startsWith("[") && value.endsWith("]")),
  "isIpAddress"
);

// src/lib/isValidHostLabel.ts
const VALID_HOST_LABEL_REGEX = /^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$/;

const isValidHostLabel = setName((value, allowSubDomains = false) => {
  if (!allowSubDomains)
    return VALID_HOST_LABEL_REGEX.test(value);

  return value.split(".").every(label => isValidHostLabel(label));
}, "isValidHostLabel");

// src/utils/customEndpointFunctions.ts
const customEndpointFunctions = {};

// src/debug/debugId.ts
const debugId = "endpoints";

// src/debug/toDebugString.ts
function toDebugString(input) {
  if (typeof input !== "object" || input == null) return input;
  if ("ref" in input) return `$${toDebugString(input.ref)}`;
  if ("fn" in input) return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
  return JSON.stringify(input, null, 2);
}

setName(toDebugString, "toDebugString");

// src/types/EndpointError.ts
class EndpointError extends Error {
  constructor(message) {
    super(message);
    this.name = "EndpointError";
  }
}

setName(EndpointError, "EndpointError");

// Similar refactoring for other src/lib methods and utility functions...

module.exports = {
  EndpointCache,
  isIpAddress,
  isValidHostLabel,
  customEndpointFunctions,
  resolveEndpoint,
  EndpointError
};
