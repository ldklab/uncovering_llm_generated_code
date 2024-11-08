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

const works = (code) => {
  try {
    eval(`(() => { ${code} })`);
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

const [major, minor] = process.versions.node.split('.').map(Number);

if (major > 10 || (major === 10 && minor >= 4)) {
  plugins.push(require.resolve("@babel/plugin-syntax-import-meta"));
}

if (major > 14 || (major === 14 && minor >= 3)) {
  plugins.push(require.resolve("@babel/plugin-syntax-top-level-await"));
}

if (
  major > 20 ||
  (major === 20 && minor >= 10) ||
  (major === 18 && minor >= 20)
) {
  plugins.push(require.resolve("@babel/plugin-syntax-import-attributes"));
}

module.exports = () => ({ plugins });
