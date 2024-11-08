(function (name, context, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
    define(definition);
  } else {
    context[name] = definition();
  }
})('urljoin', this, function () {

  function normalize(strArray) {
    var resultArray = [];
    if (!strArray.length) return '';

    if (typeof strArray[0] !== 'string') {
      throw new TypeError('Url must be a string. Received ' + strArray[0]);
    }

    if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
      var first = strArray.shift();
      strArray[0] = first + strArray[0];
    }

    if (strArray[0].match(/^file:\/\/\//)) {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
    } else {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
    }

    for (var i = 0; i < strArray.length; i++) {
      var component = strArray[i];

      if (typeof component !== 'string') {
        throw new TypeError('Url must be a string. Received ' + component);
      }

      if (!component) continue;

      if (i > 0) {
        component = component.replace(/^[\/]+/, '');
      }

      if (i < strArray.length - 1) {
        component = component.replace(/[\/]+$/, '');
      } else {
        component = component.replace(/[\/]+$/, '/');
      }

      resultArray.push(component);
    }

    var str = resultArray.join('/');
    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

    var parts = str.split('?');
    str = parts.shift() + (parts.length ? '?' : '') + parts.join('&');

    return str;
  }

  return function () {
    var input = typeof arguments[0] === 'object' ? arguments[0] : [].slice.call(arguments);
    return normalize(input);
  };

});
