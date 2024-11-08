function normalizeURLParts(partsArray) {
  if (partsArray.length === 0) return '';

  return partsArray.reduce((acc, part, index) => {
    if (typeof part !== 'string') {
      throw new TypeError(`Url must be a string. Received ${part}`);
    }

    if (index === 0) {
      if (part.match(/^[^/:]+:\/*$/) && partsArray.length > 1) {
        part += partsArray[index + 1];
        partsArray.splice(index + 1, 1);
      }

      part = part.replace(/^([^/:]+):\/*/, '$1://');
      if (part.match(/^file:\/\/\//)) {
        part = part.replace(/^([^/:]+):\/*/, '$1:///');
      }
    } else {
      part = part.replace(/^[\/]+/, '');
    }

    if (index < partsArray.length - 1) {
      part = part.replace(/[\/]+$/, '');
    } else {
      part = part.replace(/[\/]+$/, '/');
    }

    if (part) {
      acc.push(part);
    }

    return acc;
  }, []).join('/')
    .replace(/\/(\?|&|#[^!])/g, '$1')
    .replace(/\?/, match => match.replace('?', '&'));
}

export default function joinURL() {
  const inputs = Array.isArray(arguments[0]) ? arguments[0] : Array.from(arguments);
  return normalizeURLParts(inputs);
}
