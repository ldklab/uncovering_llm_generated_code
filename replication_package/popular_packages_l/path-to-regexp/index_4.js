// path-to-regexp/index.js

function parse(path, options = {}) {
  const tokens = [];
  let i = 0, isEscaping = false, isParameter = false;
  let nameBuffer = '', pathBuffer = '';

  while (i < path.length) {
    const char = path[i];
    if (isEscaping) {
      pathBuffer += char;
      isEscaping = false;
    } else if (char === '\\') {
      isEscaping = true;
    } else if (char === ':' && !isParameter) {
      if (pathBuffer) tokens.push({ type: 'text', value: pathBuffer });
      pathBuffer = '';
      nameBuffer = '';
      isParameter = true;
    } else if (isParameter && (char === '/' || i === path.length - 1)) {
      if (i === path.length - 1 && char !== '/') nameBuffer += char;
      tokens.push({ type: 'parameter', name: nameBuffer.trim() });
      isParameter = false;
      pathBuffer = '';
    } else {
      isParameter ? nameBuffer += char : pathBuffer += char;
    }
    i++;
  }

  if (pathBuffer) tokens.push({ type: 'text', value: pathBuffer });
  return { tokens };
}

function pathToRegexp(path, options = {}) {
  const tokenData = parse(path, options);
  const keys = [];
  const regexpString = tokenData.tokens.map(token => {
    if (token.type === 'parameter') {
      keys.push(token);
      return `(?<${token.name}>[^/]+?)`;
    }
    return token.value.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
  }).join('');

  const endOption = options.end !== false;
  const flags = options.sensitive ? '' : 'i';
  return {
    regexp: new RegExp(`^${regexpString}${endOption ? '$' : ''}`, flags),
    keys
  };
}

function compile(path, options = {}) {
  const tokenData = parse(path, options);
  return params => {
    return tokenData.tokens.map(token => {
      if (token.type === 'parameter') {
        const param = params[token.name];
        return Array.isArray(param) ? param.join('/') : encodeURIComponent(param || '');
      }
      return token.value;
    }).join('');
  };
}

function match(path, options = {}) {
  const { regexp, keys } = pathToRegexp(path, options);
  return against => {
    const match = regexp.exec(against);
    if (!match) return false;

    const params = keys.reduce((acc, key) => {
      acc[key.name] = match.groups[key.name];
      return acc;
    }, {});
    
    return { path: against, params };
  };
}

function stringify(tokenData) {
  return tokenData.tokens.map(token => {
    return token.type === 'parameter' ? `:${token.name}` : token.value;
  }).join('');
}

module.exports = { parse, pathToRegexp, compile, match, stringify };
