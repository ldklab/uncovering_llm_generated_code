function normalize(strArray) {
  const resultArray = [];
  
  if (strArray.length === 0) return '';

  if (typeof strArray[0] !== 'string') {
    throw new TypeError('Url must be a string. Received ' + strArray[0]);
  }

  if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
    const first = strArray.shift();
    strArray[0] = first + strArray[0];
  }

  if (strArray[0].match(/^file:\/\/\//)) {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
  } else {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
  }

  strArray.forEach((component, index) => {
    if (typeof component !== 'string') {
      throw new TypeError('Url must be a string. Received ' + component);
    }

    if (component === '') return;

    if (index > 0) {
      component = component.replace(/^[\/]+/, '');
    }
    
    if (index < strArray.length - 1) {
      component = component.replace(/[\/]+$/, '');
    } else {
      component = component.replace(/[\/]+$/, '/');
    }

    resultArray.push(component);
  });

  let str = resultArray.join('/');
  
  str = str.replace(/\/(\?|&|#[^!])/g, '$1');

  const parts = str.split('?');
  str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');

  return str;
}

export default function urlJoin(...args) {
  const input = (typeof args[0] === 'object') ? args[0] : args;
  return normalize(input);
}