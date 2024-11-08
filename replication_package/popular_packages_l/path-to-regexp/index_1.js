// path-to-regexp/index.js

function parse(path, options = {}) {
  const tokens = [];
  let i = 0, key = 0, isEscaping = false, isParameter = false;
  let nameBuffer = '', textBuffer = '';

  while (i < path.length) {
    const char = path[i];
    if (isEscaping) {
      textBuffer += char;
      isEscaping = false;
    } else if (char === '\\') {
      isEscaping = true;
    } else if (char === ':' && !isParameter) {
      if (textBuffer) tokens.push({ type: 'text', value: textBuffer });
      textBuffer = '';
      nameBuffer = '';
      isParameter = true;
    } else if (isParameter && (char === '/' || i === path.length - 1)) {
      if (i === path.length - 1 && char !== '/') nameBuffer += char;
      tokens.push({ type: 'parameter', name: nameBuffer.trim() });
      isParameter = false;
      textBuffer = '';
    } else {
      if (isParameter) nameBuffer += char;
      else textBuffer += char;
    }
    i++;
  }

  if (textBuffer) tokens.push({ type: 'text', value: textBuffer });

  return { tokens };
}

function pathToRegexp(path, options = {}) {
  const { tokens } = parse(path, options);
  const keys = tokens.filter(t => t.type === 'parameter');
  const regexpString = tokens.map(token => {
    if (token.type === 'parameter') return `(?<${token.name}>[^/]+?)`;
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
  const { tokens } = parse(path, options);
  return params => tokens.map(token => {
    if (token.type === 'parameter') {
      const param = params[token.name];
      if (Array.isArray(param)) return param.join('/');
      return encodeURIComponent(param || '');
    }
    return token.value;
  }).join('');
}

function match(path, options = {}) {
  const { regexp, keys } = pathToRegexp(path, options);
  return input => {
    const matchResult = regexp.exec(input);
    if (!matchResult) return false;
    const params = keys.reduce((acc, key) => {
      acc[key.name] = matchResult.groups[key.name];
      return acc;
    }, {});
    return { path: input, params };
  };
}

function stringify(tokenData) {
  return tokenData.tokens.map(token => token.type === 'parameter' ? `:${token.name}` : token.value).join('');
}

module.exports = { parse, pathToRegexp, compile, match, stringify };
