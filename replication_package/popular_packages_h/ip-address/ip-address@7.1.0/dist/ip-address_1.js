"use strict";

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}

function __setModuleDefault(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.v6 = exports.Address6 = exports.Address4 = void 0;

const { Address4 } = require("./lib/ipv4");
const { Address6 } = require("./lib/ipv6");
const helpers = __importStar(require("./lib/v6/helpers"));

exports.Address4 = Address4;
exports.Address6 = Address6;
exports.v6 = { helpers: helpers };

//# sourceMappingURL=ip-address.js.map
