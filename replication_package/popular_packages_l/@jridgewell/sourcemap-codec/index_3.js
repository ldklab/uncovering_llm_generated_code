// Implementation for source map codec using VLQ encoding and decoding

function vlqEncode(value) {
  let result = '';
  let vlq = (value < 0 ? (-value << 1) + 1 : value << 1) >>> 0; // VLQ transformation

  do {
    let digit = vlq & 31; // Extract 5 bits
    vlq >>>= 5; // Right shift by 5 bits
    if (vlq > 0) {
      digit |= 32; // Set continuation bit if more digits remain
    }
    result += encodeBase64(digit); // Convert to base64 character
  } while (vlq > 0);

  return result;
}

function vlqDecode(chars, index) {
  let result = 0, shift = 0;
  let value, continuation;
  
  do {
    value = decodeBase64(chars.charAt(index++)); // Decode base64 character
    continuation = value & 32; // Check continuation bit
    result += (value & 31) << shift; // Add to result after shifting
    shift += 5; // Shift by 5 for next value
  } while (continuation);
  
  // Return the decoded value and the new index position
  return [result & 1 ? ~(result >>> 1) : (result >>> 1), index];
}

function encodeBase64(value) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  return chars[value]; // Use char set to get base64 encoding
}

function decodeBase64(char) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  return chars.indexOf(char); // Get the index from base64 character set
}

// Encodes decoded mappings to string format used in sourcemaps
export function encode(decoded) {
  return decoded.map(line => line.map(segment => segment.map((value, index) => {
    if (index === 0) return vlqEncode(value);
    return vlqEncode(value - (segment[index-1] || 0)); // Encode difference from previous value
  }).join('')).join(',')).join(';');
}

// Decodes the encoded string from sourcemaps to detailed mapping array
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
        column += (decoded[0] || 0); // Decode and accumulate column
        decoded.push(column);

        if (index < segment.length) {
          [sourceIndex, index] = vlqDecode(segment, index);
          sourceIndex += (decoded[1] || 0); // Decode and accumulate sourceIndex
          decoded.push(sourceIndex);

          if (index < segment.length) {
            [sourceLine, index] = vlqDecode(segment, index);
            sourceLine += (decoded[2] || 0); // Decode and accumulate sourceLine
            decoded.push(sourceLine);

            if (index < segment.length) {
              [sourceColumn, index] = vlqDecode(segment, index);
              sourceColumn += (decoded[3] || 0); // Decode and accumulate sourceColumn
              decoded.push(sourceColumn);

              if (index < segment.length) {
                [nameIndex, index] = vlqDecode(segment, index);
                nameIndex += (decoded[4] || 0); // Decode and accumulate nameIndex
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
