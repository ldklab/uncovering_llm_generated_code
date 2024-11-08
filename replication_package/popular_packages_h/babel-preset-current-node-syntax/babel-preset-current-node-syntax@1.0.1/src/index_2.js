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
    "(class { #x() {} })",
  ],
  "logical-assignment-operators": ["a ||= b", "a &&= b", "a ??= c"],
};

const plugins = [];
const works = (test) => {
  try {
    eval(`(() => { ${test} })`);
    return true;
  } catch {
    return false;
  }
};

for (const [name, cases] of Object.entries(tests)) {
  if (cases.some(works)) {
    plugins.push(require.resolve(`@babel/plugin-syntax-${name}`));
  }
}

const major = parseInt(process.versions.node, 10);
const minor = parseInt(process.versions.node.split('.')[1], 10);

if (major > 10 || (major === 10 && minor >= 4)) {
  plugins.push(require.resolve("@babel/plugin-syntax-import-meta"));
}

if (major > 14 || (major === 14 && minor >= 3)) {
  plugins.push(require.resolve("@babel/plugin-syntax-top-level-await"));
}

module.exports = () => ({ plugins });
