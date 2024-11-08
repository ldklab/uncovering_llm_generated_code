var INTERPOLATE = /{([^{]+?)}/g;

module.exports = function(templateString, data) {
  var templateFunctionBody = `
    var resultArray = [], print = function() {
      resultArray.push.apply(resultArray, arguments);
    };
    with(obj || {}) {
      resultArray.push('
        ${templateString
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(INTERPOLATE, function(match, code) {
            return `',${code.replace(/\\'/g, "'")},'`;
          })
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
          .replace(/\t/g, '\\t')}
      ');
    }
    return resultArray.join('');
  `;

  var renderFunction = new Function('obj', templateFunctionBody);
  return data ? renderFunction(data) : renderFunction;
}
