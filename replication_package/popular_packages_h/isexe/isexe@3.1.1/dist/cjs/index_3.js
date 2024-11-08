"use strict";

// Utility function for creating a property binding
function __createBinding(o, m, k, k2 = k) {
  const desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || (!("get" in desc) && desc.writable && desc.configurable)) {
    Object.defineProperty(o, k2, { enumerable: true, get: () => m[k] });
  }
}

// Set the default export for a module
function __setModuleDefault(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}

// Helper function to import all properties from a module
function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  const result = {};
  if (mod != null) for (let k in mod) if (k !== "default") __createBinding(result, mod, k);
  __setModuleDefault(result, mod);
  return result;
}

// Helper function to export all properties of a module except "default"
function __exportStar(m, exports) {
  for (let p in m) if (p !== "default") __createBinding(exports, m, p);
}

Object.defineProperty(exports, "__esModule", { value: true });

const posix = __importStar(require("./posix.js"));
exports.posix = posix;
const win32 = __importStar(require("./win32.js"));
exports.win32 = win32;

__exportStar(require("./options.js"), exports);

const platform = process.env._ISEXE_TEST_PLATFORM_ || process.platform;
const impl = platform === 'win32' ? win32 : posix;

exports.isexe = impl.isexe;
exports.sync = impl.sync;
