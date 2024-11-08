const tests = {
  // ECMAScript 2018
  "object-rest-spread": ["({ ...{} })", "({ ...x } = {})"],
  "async-generators": ["async function* f() {}"],

  // ECMAScript 2019
  "optional-catch-binding": ["try {} catch {}"],
  "json-strings": ["'\\u2028'"],

  // ECMAScript 2020
  "bigint": ["1n"],
  "optional-chaining": ["a?.b"],
  "nullish-coalescing-operator": ["a ?? b"],

  // Stage 3
  "numeric-separator": ["1_2"],
  "class-properties": [
    "(class { x = 1 })",
    "(class { #x = 1 })",
    "(class { #x() {} })"
  ],
  "logical-assignment-operators": ["a ||= b", "a &&= b", "a ??= c"]
};

const plugins = [];

const isSyntaxSupported = (test) => {
  try {
    (0, eval)(`(() => { ${test} })`);
    return true;
  } catch {
    return false;
  }
};

for (const [feature, testCases] of Object.entries(tests)) {
  if (testCases.some(isSyntaxSupported)) {
    plugins.push(require.resolve(`@babel/plugin-syntax-${feature}`));
  }
}

const [major, minor] = process.versions.node.split('.').map(Number);

if (major > 10 || (major === 10 && minor >= 4)) {
  plugins.push(require.resolve("@babel/plugin-syntax-import-meta"));
}

if (major > 14 || (major === 14 && minor >= 3)) {
  plugins.push(require.resolve("@babel/plugin-syntax-top-level-await"));
}

module.exports = () => ({ plugins });
