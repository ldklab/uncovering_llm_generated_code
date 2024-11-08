// @jridgewell/sourcemap-codec implementation

function vlqEncode(value) {
  let result = '';
  let vlq = (value < 0 ? (-value << 1) + 1 : value << 1) >>> 0;

  do {
    let digit = vlq & 31;
    vlq >>>= 5;
    if (vlq > 0) {
      digit |= 32;
    }
    result += encodeBase64(digit);
  } while (vlq > 0);

  return result;
}

function vlqDecode(chars, index) {
  let result = 0, shift = 0, value, continuation;
  
  do {
    value = decodeBase64(chars.charAt(index++));
    continuation = value & 32;
    result += (value & 31) << shift;
    shift += 5;
  } while (continuation);
  
  return [result & 1 ? ~(result >>> 1) : (result >>> 1), index];
}

function encodeBase64(value) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  return chars[value];
}

function decodeBase64(char) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  return chars.indexOf(char);
}

export function encode(decoded) {
  return decoded.map(line => line.map(segment => segment.map((value, index) => {
    if (index === 0) return vlqEncode(value);
    return vlqEncode(value - (segment[index-1] || 0));
  }).join('')).join(',')).join(';');
}

export function decode(encoded) {
  const lines = encoded.split(';');
  return lines.map(line => {
    let segments = line.split(',');
    let column = 0;
    let sourceIndex = 0;
    let sourceLine = 0;
    let sourceColumn = 0;
    let nameIndex = 0;

    return segments.map(segment => {
      let decoded = [];
      let index = 0;
      if (segment) {
        [column, index] = vlqDecode(segment, index);
        column += (decoded[0] || 0);
        decoded.push(column);

        if (index < segment.length) {
          [sourceIndex, index] = vlqDecode(segment, index);
          sourceIndex += (decoded[1] || 0);
          decoded.push(sourceIndex);

          if (index < segment.length) {
            [sourceLine, index] = vlqDecode(segment, index);
            sourceLine += (decoded[2] || 0);
            decoded.push(sourceLine);

            if (index < segment.length) {
              [sourceColumn, index] = vlqDecode(segment, index);
              sourceColumn += (decoded[3] || 0);
              decoded.push(sourceColumn);

              if (index < segment.length) {
                [nameIndex, index] = vlqDecode(segment, index);
                nameIndex += (decoded[4] || 0);
                decoded.push(nameIndex);
              }
            }
          }
        }
      }
      return decoded;
    });
  });
}
