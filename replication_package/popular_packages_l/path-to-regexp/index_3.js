function parse(path, options = {}) {
  const tokens = [];
  let i = 0, key = 0, escapeFlag = false, paramFlag = false;
  let nameBuffer = '', pathBuffer = '';

  while (i < path.length) {
    const char = path[i];
    if (escapeFlag) {
      pathBuffer += char;
      escapeFlag = false;
    } else if (char === '\\') {
      escapeFlag = true;
    } else if (char === ':' && !paramFlag) {
      if (pathBuffer) tokens.push({ type: 'text', value: pathBuffer });
      pathBuffer = '';
      nameBuffer = '';
      paramFlag = true;
    } else if (paramFlag && (char === '/' || i === path.length - 1)) {
      if (i === path.length - 1 && char !== '/') nameBuffer += char;
      tokens.push({ type: 'parameter', name: nameBuffer.trim() });
      paramFlag = false;
    } else {
      if (paramFlag) nameBuffer += char;
      else pathBuffer += char;
    }
    i++;
  }

  if (pathBuffer) tokens.push({ type: 'text', value: pathBuffer });

  return { tokens };
}

function pathToRegexp(path, options = {}) {
  const tokenData = parse(path, options);
  const keys = tokenData.tokens.filter(token => token.type === 'parameter');
  const pattern = tokenData.tokens.map(token => {
    if (token.type === 'parameter') {
      return `(?<${token.name}>[^/]+?)`;
    } else {
      return token.value.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
    }
  }).join('');

  const flags = options.sensitive ? '' : 'i';
  return {
    regexp: new RegExp(`^${pattern}${options.end !== false ? '$' : ''}`, flags),
    keys
  };
}

function compile(path, options = {}) {
  const tokenData = parse(path, options);

  return params => {
    return tokenData.tokens.map(token => {
      if (token.type === 'parameter') {
        const paramValue = params[token.name];
        return Array.isArray(paramValue) ? paramValue.join('/') : encodeURIComponent(paramValue || '');
      }
      return token.value;
    }).join('');
  };
}

function match(path, options = {}) {
  const { regexp, keys } = pathToRegexp(path, options);

  return input => {
    const matched = regexp.exec(input);
    if (!matched) return false;

    const params = keys.reduce((acc, key, index) => {
      acc[key.name] = matched.groups[key.name];
      return acc;
    }, {});

    return { path: input, params };
  };
}

function stringify(tokenData) {
  return tokenData.tokens.map(token => {
    return token.type === 'parameter' ? `:${token.name}` : token.value;
  }).join('');
}

module.exports = { parse, pathToRegexp, compile, match, stringify };
