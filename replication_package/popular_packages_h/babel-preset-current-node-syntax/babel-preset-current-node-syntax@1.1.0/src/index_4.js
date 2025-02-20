const tests = {
  // ECMAScript 2018
  "object-rest-spread": ["({ ...{} })", "({ ...x } = {})"],
  "async-generators": ["async function* f() {}"],

  // ECMAScript 2019
  "optional-catch-binding": ["try {} catch {}"],
  "json-strings": ["'\\u2028'"],

  // ECMAScript 2020
  bigint: ["1n"],
  "optional-chaining": ["a?.b"],
  "nullish-coalescing-operator": ["a ?? b"],

  // ECMAScript 2021
  "numeric-separator": ["1_2"],
  "logical-assignment-operators": ["a ||= b", "a &&= b", "a ??= c"],

  // ECMAScript 2022
  "class-properties": ["(class { x = 1 })", "(class { #x = 1 })", "(class { #x() {} })"],
  "private-property-in-object": ["(class { #x; m() { #x in y } })"],
  "class-static-block": ["(class { static {} })"],
};

const plugins = [];
const works = (test) => {
  try {
    eval(`(() => { ${test} })`);
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

const [major, minor] = process.versions.node.split('.').map(Number);

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
