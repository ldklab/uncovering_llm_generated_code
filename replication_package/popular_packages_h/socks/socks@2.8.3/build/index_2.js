"use strict";

// Helper function to create bindings between modules
function createBinding(o, m, k, k2 = k) {
  let desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}

// Function to export all properties from one module to another
function exportStar(m, exports) {
  for (let key in m) {
    if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
      createBinding(exports, m, key);
    }
  }
}

// Set module as an ES module
Object.defineProperty(exports, "__esModule", { value: true });

// Re-export all exports from the './client/socksclient' module
exportStar(require("./client/socksclient"), exports);
