(function (name, context, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
    define(definition);
  } else {
    context[name] = definition();
  }
})('urljoin', this, function () {

  function normalizeUrl(parts) {
    const normalizedParts = [];
    if (parts.length === 0) return '';

    if (typeof parts[0] !== 'string') {
      throw new TypeError('Url must be a string. Received ' + parts[0]);
    }

    if (parts[0].match(/^[^/:]+:\/*$/) && parts.length > 1) {
      const protocol = parts.shift();
      parts[0] = protocol + parts[0];
    }

    parts[0] = parts[0].replace(/^([^/:]+):\/*/, (match, protocol) => protocol === 'file' ? 'file:///' : `${protocol}://`);

    parts.forEach((component, index) => {
      if (typeof component !== 'string') {
        throw new TypeError('Url must be a string. Received ' + component);
      }
      if (component === '') return;

      if (index > 0) {
        component = component.replace(/^[\/]+/, '');
      }
      if (index < parts.length - 1) {
        component = component.replace(/[\/]+$/, '');
      } else {
        component = component.replace(/[\/]+$/, '/');
      }

      normalizedParts.push(component);
    });

    let result = normalizedParts.join('/');
    result = result.replace(/\/(\?|&|#[^!])/g, '$1');
    
    const [base, ...queries] = result.split('?');
    return base + (queries.length > 0 ? '?' : '') + queries.join('&');
  }

  return function (...args) {
    const inputParts = typeof args[0] === 'object' ? args[0] : args;
    return normalizeUrl(inputParts);
  };

});
