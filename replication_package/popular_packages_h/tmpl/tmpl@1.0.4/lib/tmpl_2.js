const INTERPOLATE = /{([\s\S]+?)}/g;

module.exports = function(template, data) {
  let templateCode = `
    var result = [];
    var print = function() { result.push(...arguments); };
    with(obj || {}) {
      result.push('
        ${template.replace(/\\/g, '\\\\')
                  .replace(/'/g, "\\'")
                  .replace(INTERPOLATE, (match, code) => {
                    return "'," + code.replace(/\\'/g, "'") + ",'";
                  })
                  .replace(/\r/g, '\\r')
                  .replace(/\n/g, '\\n')
                  .replace(/\t/g, '\\t')
      }');
    }
    return result.join('');
  `;
  
  const generateFunction = new Function('obj', templateCode);
  return data ? generateFunction(data) : generateFunction;
};
