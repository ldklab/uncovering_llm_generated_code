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
const works = (test) => {
  try {
    (0, eval)(`(() => { ${test} })`);
    return true;
  } catch (_error) {
    return false;
  }
};

for (const [name, cases] of Object.entries(tests)) {
  if (cases.some(works)) {
    plugins.push(require.resolve(`@babel/plugin-syntax-${name}`));
  }
}

const major = parseInt(process.versions.node, 10);
const minor = parseInt(process.versions.node.match(/^\d+\.(\d+)/)[1], 10);
if (major > 10 || (major === 10 && minor >= 4)) {
  plugins.push(require.resolve("@babel/plugin-syntax-import-meta"));
}
if (major > 14 || (major === 14 && minor >= 3)) {
  plugins.push(require.resolve("@babel/plugin-syntax-top-level-await"));
}

module.exports = () => ({ plugins });
