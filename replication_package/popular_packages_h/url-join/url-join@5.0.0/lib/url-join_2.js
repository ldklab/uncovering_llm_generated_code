function normalize(strArray) {
  const resultArray = [];
  if (strArray.length === 0) return '';

  if (typeof strArray[0] !== 'string') {
    throw new TypeError(`Url must be a string. Received ${strArray[0]}`);
  }

  if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
    const first = strArray.shift();
    strArray[0] = first + strArray[0];
  }

  strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, (strArray[0].startsWith('file:///') ? '$1:///' : '$1://'));

  for (let i = 0; i < strArray.length; i++) {
    let component = strArray[i];

    if (typeof component !== 'string') {
      throw new TypeError(`Url must be a string. Received ${component}`);
    }
    if (component === '') continue;

    if (i > 0) component = component.replace(/^[\/]+/, '');
    if (i < strArray.length - 1) component = component.replace(/[\/]+$/, '');
    else component = component.replace(/[\/]+$/, '/');

    resultArray.push(component);
  }

  let str = resultArray.join('/');
  str = str.replace(/\/(\?|&|#[^!])/g, '$1');

  const parts = str.split('?');
  str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');

  return str;
}

export default function urlJoin(...args) {
  const input = Array.isArray(args[0]) ? args[0] : args;
  return normalize(input);
}
