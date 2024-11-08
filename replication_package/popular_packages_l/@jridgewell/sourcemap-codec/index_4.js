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

export function encode(decodedMappings) {
  return decodedMappings.map(line => 
    line.map(segment => 
      segment.map((value, index) => vlqEncode(index === 0 ? value : value - (segment[index - 1] || 0)))
        .join('')
    ).join(',')
  ).join(';');
}

export function decode(encodedMappings) {
  return encodedMappings.split(';').map(line => {
    let segments = line.split(',');
    let prevValues = [0, 0, 0, 0, 0];

    return segments.map(segment => {
      const decodedSegment = [];
      let index = 0;
      
      if (segment) {
        [prevValues[0], index] = vlqDecode(segment, index);
        decodedSegment.push(prevValues[0]);

        if (index < segment.length) {
          [prevValues[1], index] = vlqDecode(segment, index);
          decodedSegment.push(prevValues[1]);

          if (index < segment.length) {
            [prevValues[2], index] = vlqDecode(segment, index);
            decodedSegment.push(prevValues[2]);

            if (index < segment.length) {
              [prevValues[3], index] = vlqDecode(segment, index);
              decodedSegment.push(prevValues[3]);

              if (index < segment.length) {
                [prevValues[4], index] = vlqDecode(segment, index);
                decodedSegment.push(prevValues[4]);
              }
            }
          }
        }
      }
      return decodedSegment;
    });
  });
}
