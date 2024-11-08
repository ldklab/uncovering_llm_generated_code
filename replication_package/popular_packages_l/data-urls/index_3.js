const { MIMEType } = require('whatwg-mimetype');
const { labelToName, decode: whatwgDecode } = require('whatwg-encoding');
const { parseURL } = require('whatwg-url');

// Parses a Data URL string into its components
function parseDataURL(dataURLString) {
  // Check if the input string is indeed a Data URL
  if (!dataURLString.startsWith('data:')) {
    return null; // Not a valid Data URL
  }

  try {
    // Decode the Data URL (omit the "data:" prefix)
    const dataURL = decodeURIComponent(dataURLString.slice(5));
    // Separate the MIME type from the actual data
    const [mimeTypeString, data] = dataURL.split(',');

    // Create a MIMEType object to parse the MIME type string
    const mimeType = new MIMEType(mimeTypeString);
    // Determine if the data is encoded in Base64
    const isBase64 = mimeTypeString.includes(';base64');
    // Decode data into a buffer
    const body = isBase64 ? Buffer.from(data, 'base64') : new TextEncoder().encode(data);

    // Return an object with the parsed MIME type and data body as Uint8Array
    return { mimeType, body: new Uint8Array(body) };
  } catch {
    return null; // Return null on parsing failure
  }
}

// Converts a URLRecord to a parsed Data URL
function fromURLRecord(urlRecord) {
  // Create a Data URL string from the URL record's scheme data
  const dataURLString = `data:${urlRecord.schemeData}`;
  // Parse the Data URL string
  return parseDataURL(dataURLString);
}

// Decodes the body of a parsed Data URL using the specified or default character set
function decodeBody(dataURL) {
  // Get the charset parameter from MIME type, fallback to 'utf-8'
  const charset = dataURL.mimeType.parameters.get('charset') || 'utf-8';
  // Find the encoding name for the charset
  const encodingName = labelToName(charset);
  // Decode the body using the identified encoding
  return whatwgDecode(dataURL.body, encodingName);
}

module.exports = parseDataURL;

// Example usage of parsing a Data URL
const dataURLExample = parseDataURL('data:,Hello%2C%20World!');
if (dataURLExample) {
  console.log(dataURLExample.mimeType.toString()); // text/plain;charset=US-ASCII
  console.log(dataURLExample.body); // Uint8Array representing "Hello, World!"
}

// Example usage of converting from a URL record
const urlRecord = parseURL('data:,Hello%2C%20World!');
const dataURLFromRecord = fromURLRecord(urlRecord);
if (dataURLFromRecord) {
  console.log(dataURLFromRecord.mimeType.toString()); // "text/plain;charset=US-ASCII"
}

// Example of decoding the body of a Data URL
const decodedBody = decodeBody(dataURLExample);
console.log(decodedBody); // "Hello, World!"
