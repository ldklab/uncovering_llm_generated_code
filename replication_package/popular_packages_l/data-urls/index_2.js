const { MIMEType } = require('whatwg-mimetype');
const { labelToName, decode: whatwgDecode } = require('whatwg-encoding');
const { parseURL } = require('whatwg-url');

/**
 * Parses a Data URL string and returns its MIME type and data payload.
 * 
 * @param {string} dataURLString - A string representing the Data URL.
 * @returns {?Object} An object with mimeType and body properties or null if parsing fails.
 */
function parseDataURL(dataURLString) {
  if (!dataURLString.startsWith('data:')) {
    return null;
  }

  try {
    // Decode the Data URL by removing 'data:' and decoding the rest.
    const dataURL = decodeURIComponent(dataURLString.slice(5));
    const [mimeTypeString, data] = dataURL.split(',');

    // Create a MIMEType object from the mimeTypeString part.
    const mimeType = new MIMEType(mimeTypeString);
    const isBase64 = mimeTypeString.includes(';base64');

    // Decode the data part based on whether it's base64 encoded.
    const body = isBase64 ? Buffer.from(data, 'base64') : new TextEncoder().encode(data);

    // Return the parsed MIME type and the data as a Uint8Array.
    return { mimeType, body: new Uint8Array(body) };
  } catch {
    return null;
  }
}

/**
 * Converts a URL record into a Data URL object containing its MIME type and data payload.
 * 
 * @param {Object} urlRecord - An object representing a URL record.
 * @returns {?Object} An object with mimeType and body properties or null if conversion fails.
 */
function fromURLRecord(urlRecord) {
  const dataURLString = `data:${urlRecord.schemeData}`;
  return parseDataURL(dataURLString);
}

/**
 * Decodes the body of a parsed Data URL using the specified charset in its MIME type.
 * 
 * @param {Object} dataURL - An object containing parsed data URL information.
 * @returns {string} A string representing the decoded data payload.
 */
function decodeBody(dataURL) {
  const charset = dataURL.mimeType.parameters.get('charset') || 'utf-8';
  const encodingName = labelToName(charset);

  // Decode the data using the appropriate character encoding.
  return whatwgDecode(dataURL.body, encodingName);
}

// Export the parseDataURL function as the module's primary export.
module.exports = parseDataURL;

// Demonstration of how to use the exported functions.
const dataURLExample = parseDataURL('data:,Hello%2C%20World!');
if (dataURLExample) {
  console.log(dataURLExample.mimeType.toString()); // Outputs: text/plain;charset=US-ASCII
  console.log(dataURLExample.body); // Outputs: Uint8Array containing bytes for "Hello, World!"
}

// Example demonstrating how to use fromURLRecord.
const urlRecord = parseURL('data:,Hello%2C%20World!');
const dataURLFromRecord = fromURLRecord(urlRecord);
if (dataURLFromRecord) {
  console.log(dataURLFromRecord.mimeType.toString()); // Outputs: "text/plain;charset=US-ASCII"
}

// Decode the body content of the data URL.
const decodedBody = decodeBody(dataURLExample);
console.log(decodedBody); // Outputs: "Hello, World!"
