(function(name, context, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
    define(definition);
  } else {
    context[name] = definition();
  }
})('urljoin', this, function() {

  function normalize(urlParts) {
    if (!urlParts.length) return '';

    if (typeof urlParts[0] !== 'string') throw new TypeError('Url must be a string. Received ' + urlParts[0]);

    if (urlParts[0].match(/^[^/:]+:\/*$/) && urlParts.length > 1) {
      urlParts[0] += urlParts[1];
      urlParts.splice(1, 1);
    }

    urlParts[0] = urlParts[0].replace(/^([^/:]+):\/*/, (match, protocol) =>
      protocol === 'file' ? `${protocol}:///` : `${protocol}://`
    );

    const normalizedUrl = urlParts.map((part, index) => {
      if (typeof part !== 'string') throw new TypeError('Url must be a string. Received ' + part);
      if (!part) return '';
      if (index > 0) part = part.replace(/^[\/]+/, '');
      if (index < urlParts.length - 1) part = part.replace(/[\/]+$/, '');
      else part = part.replace(/[\/]+$/, '/');
      return part;
    }).join('/');

    const urlWithParametersFixed = normalizedUrl.replace(/\/(\?|&|#[^!])/g, '$1');
    const [base, ...params] = urlWithParametersFixed.split('?');
    return base + (params.length ? '?' + params.join('&') : '');
  }

  return function(...args) {
    const input = Array.isArray(args[0]) ? args[0] : args;
    return normalize(input);
  };
});
