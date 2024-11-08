const { MIMEType } = require('whatwg-mimetype');
const { labelToName, decode: whatwgDecode } = require('whatwg-encoding');
const { parseURL } = require('whatwg-url');

function parseDataURL(dataURLString) {
  // Check if the data URL starts with 'data:', return null if not.
  if (!dataURLString.startsWith('data:')) {
    return null;
  }

  try {
    // Decode the URL part after 'data:'.
    const dataURL = decodeURIComponent(dataURLString.slice(5));
    // Split the string into MIME type and data parts.
    const [mimeTypeString, data] = dataURL.split(',');

    // Create a MIMEType object from the MIME type string.
    const mimeType = new MIMEType(mimeTypeString);
    // Determine if the data is base64 encoded.
    const isBase64 = mimeTypeString.includes(';base64');
    // Convert data to bytes, using base64 or UTF-8 decoding as necessary.
    const body = isBase64 ? Buffer.from(data, 'base64') : new TextEncoder().encode(data);

    return { mimeType, body: new Uint8Array(body) };
  } catch {
    // Catch and return null if there's any error in URL parsing or processing.
    return null;
  }
}

function fromURLRecord(urlRecord) {
  // Constructs a full data URL from only the schemeData part of a URLRecord.
  const dataURLString = `data:${urlRecord.schemeData}`;
  return parseDataURL(dataURLString);
}

function decodeBody(dataURL) {
  // Extract the charset parameter or default to 'utf-8'.
  const charset = dataURL.mimeType.parameters.get('charset') || 'utf-8';
  // Decode the body data using the specified encoding.
  const encodingName = labelToName(charset);
  return whatwgDecode(dataURL.body, encodingName);
}

module.exports = parseDataURL;

// Example usage of the functions exported
const dataURLExample = parseDataURL('data:,Hello%2C%20World!');
if (dataURLExample) {
  console.log(dataURLExample.mimeType.toString()); // text/plain;charset=US-ASCII
  console.log(dataURLExample.body); // Uint8Array containing bytes representing "Hello, World!"
}

// Using fromURLRecord example
const urlRecord = parseURL('data:,Hello%2C%20World!');
const dataURLFromRecord = fromURLRecord(urlRecord);
if (dataURLFromRecord) {
  console.log(dataURLFromRecord.mimeType.toString()); // "text/plain;charset=US-ASCII"
}

// Decoding the body example
const decodedBody = decodeBody(dataURLExample);
console.log(decodedBody); // "Hello, World!"
