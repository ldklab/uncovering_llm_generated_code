const INTERPOLATE = /{([\s\S]+?)}/g;

module.exports = function(str, data) {
  const tmpl = `
    var __p = [],
        print = function() {
          __p.push.apply(__p, arguments);
        };
    with (obj || {}) {
      __p.push('${str.replace(/\\/g, '\\\\')
                      .replace(/'/g, "\\'")
                      .replace(INTERPOLATE, function(match, code) {
                        return "', " + code.replace(/\\'/g, "'") + ", '";
                      })
                      .replace(/\r/g, '\\r')
                      .replace(/\n/g, '\\n')
                      .replace(/\t/g, '\\t')}');
    }
    return __p.join('');
  `;
  const func = new Function('obj', tmpl);
  return data ? func(data) : func;
};
