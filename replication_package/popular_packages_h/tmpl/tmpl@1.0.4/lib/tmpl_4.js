const INTERPOLATE = /{([\s\S]+?)}/g;

module.exports = function(template, context) {
  const templateFunctionBody =
    'const __output = [], print = function() { __output.push(...arguments); };' +
    'with (data || {}) { __output.push(\'' +
    template
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(INTERPOLATE, (match, code) => {
        return "',$1," + code.replace(/\\'/g, "'") + ",'";
      })
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t') +
    "'); } return __output.join('');";
  
  const templateFunction = new Function('data', templateFunctionBody);
  return context ? templateFunction(context) : templateFunction;
}
