const INTERPOLATE = /{([^{]+?)}/g;

module.exports = function(template, data) {
  const templateString =
    "const __p = []; const print = (...args) => { __p.push(...args); }; " +
    "with(obj || {}) { __p.push('" +
    template
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(INTERPOLATE, (match, code) => "'," + code.replace(/\\'/g, "'") + ",'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t') +
    "'); } return __p.join('');";

  const templateFunction = new Function('obj', templateString);

  return data ? templateFunction(data) : templateFunction;
}
