(function(name, context, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
    define(definition);
  } else {
    context[name] = definition();
  }
})('urljoin', this, function() {
  
  function normalize(strArray) {
    if (strArray.length === 0) return '';
    if (typeof strArray[0] !== 'string') {
      throw new TypeError(`Url must be a string. Received ${strArray[0]}`);
    }

    if (/^[^/:]+:\/*$/.test(strArray[0]) && strArray.length > 1) {
      let first = strArray.shift();
      strArray[0] = first + strArray[0];
    }

    if (/^file:\/\/\//.test(strArray[0])) {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
    } else {
      strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
    }

    const resultArray = [];
    for (let i = 0; i < strArray.length; i++) {
      let component = strArray[i];
      if (typeof component !== 'string') {
        throw new TypeError(`Url must be a string. Received ${component}`);
      }
      if (component === '') continue;

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

    let str = resultArray.join('/');
    str = str.replace(/\/(\?|&|#[^!])/g, '$1');
    
    const parts = str.split('?');
    str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');

    return str;
  }

  return function(...args) {
    const input = Array.isArray(args[0]) ? args[0] : args.slice();
    return normalize(input);
  };
});
