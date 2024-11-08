const tests = {
  "object-rest-spread": ["({ ...{} })", "({ ...x } = {})"],
  "async-generators": ["async function* f() {}"],
  "optional-catch-binding": ["try {} catch {}"],
  "json-strings": ["'\\u2028'"],
  "bigint": ["1n"],
  "optional-chaining": ["a?.b"],
  "nullish-coalescing-operator": ["a ?? b"],
  "numeric-separator": ["1_2"],
  "class-properties": ["(class { x = 1 })", "(class { #x = 1 })", "(class { #x() {} })"],
  "logical-assignment-operators": ["a ||= b", "a &&= b", "a ??= c"],
};

const plugins = [];
const supportsSyntax = (test) => {
  try {
    (0, eval)(`(() => { ${test} })`);
    return true;
  } catch {
    return false;
  }
};

for (const [feature, cases] of Object.entries(tests)) {
  if (cases.some(supportsSyntax)) {
    plugins.push(require.resolve(`@babel/plugin-syntax-${feature}`));
  }
}

const nodeVersion = process.versions.node.split('.').map(Number);
const [major, minor] = nodeVersion;

if (major > 10 || (major === 10 && minor >= 4)) {
  plugins.push(require.resolve("@babel/plugin-syntax-import-meta"));
}

if (major > 14 || (major === 14 && minor >= 3)) {
  plugins.push(require.resolve("@babel/plugin-syntax-top-level-await"));
}

module.exports = () => ({ plugins });
