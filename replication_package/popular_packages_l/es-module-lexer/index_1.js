// es-module-lexer.js

let wasmLoaded = false;

// Dummy WebAssembly loader simulation
async function loadWasm() {
  return new Promise((resolve) => {
    setTimeout(() => {
      wasmLoaded = true;
      resolve();
    }, 1);
  });
}

// Initializes the wasm environment
async function init() {
  if (!wasmLoaded) {
    await loadWasm();
  }
}

// Parses source code to extract import/export details
function parse(source, sourcename = '') {
  if (!wasmLoaded) {
    throw new Error('Wasm is not initialized. Call and await `init()` first.');
  }

  const exports = [];
  const imports = [];

  const exportRegex = /export\s+(?:var|let|const|function|class|default)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g;
  let match;

  // Detect export statements
  while ((match = exportRegex.exec(source)) !== null) {
    exports.push({
      s: match.index,
      e: match.index + match[1].length,
      ls: match.index,
      le: match.index + match[1].length,
    });
  }

  const importRegex = /import\s+([^;'"]+)\s+from\s+(['"])(.*?)\2/g;

  // Detect import statements
  while ((match = importRegex.exec(source)) !== null) {
    imports.push({
      s: match.index + match[1].length + 7,
      e: match.index + match[0].length - (match[2].length + 1),
      ss: match.index,
      se: match.index + match[0].length,
      n: match[3],
      t: 1, // Marked as static
      a: -1,
      d: -1,
    });
  }

  return [imports, exports, false, imports.length > 0 || exports.length > 0];
}

module.exports = { init, parse };
