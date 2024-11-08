const tests = {
  "object-rest-spread": ["({ ...{} })", "({ ...x } = {})"],
  "async-generators": ["async function* f() {}"],
  "optional-catch-binding": ["try {} catch {}"],
  "json-strings": ["'\\u2028'"],
  bigint: ["1n"],
  "optional-chaining": ["a?.b"],
  "nullish-coalescing-operator": ["a ?? b"],
  "numeric-separator": ["1_2"],
  "logical-assignment-operators": ["a ||= b", "a &&= b", "a ??= c"],
  "class-properties": [
    "(class { x = 1 })",
    "(class { #x = 1 })",
    "(class { #x() {} })",
  ],
  "private-property-in-object": ["(class { #x; m() { #x in y } })"],
  "class-static-block": ["(class { static {} })"],
};

const plugins = [];
const isSyntaxSupported = (syntax) => {
  try {
    (0, eval)(`(() => { ${syntax} })`);
    return true;
  } catch {
    return false;
  }
};

for (const [feature, syntaxes] of Object.entries(tests)) {
  if (syntaxes.some(isSyntaxSupported)) {
    plugins.push(require.resolve(`@babel/plugin-syntax-${feature}`));
  }
}

const { node } = process.versions;
const major = parseInt(node.split('.')[0], 10);
const minor = parseInt(node.split('.')[1], 10);

if (major > 10 || (major === 10 && minor >= 4)) {
  plugins.push(require.resolve("@babel/plugin-syntax-import-meta"));
}

if (major > 14 || (major === 14 && minor >= 3)) {
  plugins.push(require.resolve("@babel/plugin-syntax-top-level-await"));
}

if (major > 20 || (major === 20 && minor >= 10) || (major === 18 && minor >= 20)) {
  plugins.push(require.resolve("@babel/plugin-syntax-import-attributes"));
}

module.exports = () => ({ plugins });
