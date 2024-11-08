// es-module-lexer.js

let wasmInitialized = false;

// Simulates loading a WebAssembly module
async function loadWebAssembly() {
  return new Promise((resolve) => {
    setTimeout(() => {
      wasmInitialized = true;
      resolve();
    }, 1);
  });
}

// Initializes the lexer environment
async function initWasm() {
  if (!wasmInitialized) {
    await loadWebAssembly();
  }
}

// Parses JavaScript/ES module source code
function parseModuleSource(source, sourceName = '') {
  if (!wasmInitialized) {
    throw new Error('WebAssembly is not initialized. Ensure `initWasm()` is called and awaited.');
  }

  const exportDeclarations = [];
  const importDeclarations = [];
  
  const exportPattern = /export\s+(?:var|let|const|function|class|default)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g;
  let matchResult;

  while ((matchResult = exportPattern.exec(source)) !== null) {
    exportDeclarations.push({
      s: matchResult.index,
      e: matchResult.index + matchResult[1].length,
      ls: matchResult.index,
      le: matchResult.index + matchResult[1].length,
    });
  }

  const importPattern = /import\s+([^;'"]+)\s+from\s+(['"])(.*?)\2/g;

  while ((matchResult = importPattern.exec(source)) !== null) {
    importDeclarations.push({
      s: matchResult.index + matchResult[1].length + 7,
      e: matchResult.index + matchResult[0].length - (matchResult[2].length + 1),
      ss: matchResult.index,
      se: matchResult.index + matchResult[0].length,
      n: matchResult[3],
      t: 1,
      a: -1,
      d: -1,
    });
  }

  return [importDeclarations, exportDeclarations, false, importDeclarations.length > 0 || exportDeclarations.length > 0];
}

module.exports = { initWasm, parseModuleSource };
