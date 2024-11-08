// @jridgewell/sourcemap-codec equivalent implementation

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function vlqEncode(value) {
  let result = '';
  let vlq = value < 0 ? (-value << 1) + 1 : value << 1;

  do {
    let digit = vlq & 31;
    vlq >>>= 5;
    if (vlq > 0) {
      digit |= 32;
    }
    result += BASE64_CHARS[digit];
  } while (vlq > 0);

  return result;
}

function vlqDecode(encoded, startIndex) {
  let result = 0, shift = 0, continuation, value;

  let index = startIndex;
  do {
    value = BASE64_CHARS.indexOf(encoded[index++]);
    continuation = value & 32;
    result += (value & 31) << shift;
    shift += 5;
  } while (continuation);

  const finalValue = result & 1 ? ~(result >>> 1) : result >>> 1;
  return [finalValue, index];
}

export function encode(decoded) {
  return decoded.map(line => line.map(segment =>
    segment.map((value, i) => vlqEncode(value - (segment[i - 1] || 0))).join('')
  ).join(',')).join(';');
}

export function decode(encoded) {
  return encoded.split(';').map(line => {
    let segments = line.split(',');
    let prevColumn = 0, prevSourceIndex = 0, prevSourceLine = 0;
    let prevSourceColumn = 0, prevNameIndex = 0;

    return segments.map(segment => {
      let decoded = [];
      let index = 0;

      if (segment) {
        const [column, newIndex] = vlqDecode(segment, index);
        prevColumn += column;
        decoded.push(prevColumn);
        index = newIndex;

        if (index < segment.length) {
          const [sourceIndex, newIndex] = vlqDecode(segment, index);
          prevSourceIndex += sourceIndex;
          decoded.push(prevSourceIndex);
          index = newIndex;

          if (index < segment.length) {
            const [sourceLine, newIndex] = vlqDecode(segment, index);
            prevSourceLine += sourceLine;
            decoded.push(prevSourceLine);
            index = newIndex;

            if (index < segment.length) {
              const [sourceColumn, newIndex] = vlqDecode(segment, index);
              prevSourceColumn += sourceColumn;
              decoded.push(prevSourceColumn);
              index = newIndex;

              if (index < segment.length) {
                const [nameIndex, newIndex] = vlqDecode(segment, index);
                prevNameIndex += nameIndex;
                decoded.push(prevNameIndex);
              }
            }
          }
        }
      }

      return decoded;
    });
  });
}
