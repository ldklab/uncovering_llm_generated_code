"use strict";
const MIMEType = require("whatwg-mimetype");
const { parseURL, serializeURL, percentDecodeString } = require("whatwg-url");
const { stripLeadingAndTrailingASCIIWhitespace, isomorphicDecode, forgivingBase64Decode } = require("./utils.js");

// Main function to parse a given string as a data URL
module.exports = inputString => {
  // Parse the input string to derive a URL record
  const urlRecord = parseURL(inputString);

  // Return null if invalid URL
  if (urlRecord === null) return null;

  // Convert the URL record into a data URL object
  return module.exports.fromURLRecord(urlRecord);
};

// Convert the URL record into a structured data URL object
module.exports.fromURLRecord = urlRecord => {
  // Ensure that the URL scheme is 'data'
  if (urlRecord.scheme !== "data") return null;

  // Extract the part of the URL after 'data:'
  const inputData = serializeURL(urlRecord, true).substring("data:".length);

  let position = 0; // Position marker within the input data
  let mimeType = ""; // Placeholder for MIME type

  // Extract MIME type from the input data until a comma is encountered
  while (position < inputData.length && inputData[position] !== ",") {
    mimeType += inputData[position++];
  }
  mimeType = stripLeadingAndTrailingASCIIWhitespace(mimeType);

  // Return null if no body is present after the MIME type
  if (position === inputData.length) return null;

  // Move past the comma
  position++;

  // Extract and decode the body of the data URL
  const encodedBody = inputData.substring(position);
  let body = percentDecodeString(encodedBody);

  // Check if the MIME type specifies base64 encoding
  const mimeTypeBase64Pattern = /(.*); *[Bb][Aa][Ss][Ee]64$/u;
  const base64Match = mimeTypeBase64Pattern.exec(mimeType);

  if (base64Match) {
    // If base64 is indicated, decode the body as base64
    const decodedStringBody = isomorphicDecode(body);
    body = forgivingBase64Decode(decodedStringBody);

    // Return null if the base64 decoding fails
    if (body === null) return null;

    // Update MIME type to exclude base64 suffix
    mimeType = base64Match[1];
  }

  // Prepend a default MIME type if none is specified
  if (mimeType.startsWith(";")) {
    mimeType = `text/plain${mimeType}`;
  }

  let mimeTypeRecord;
  try {
    // Attempt to parse MIME type into a MIMEType object
    mimeTypeRecord = new MIMEType(mimeType);
  } catch (e) {
    // Fallback to a default MIME type if parsing fails
    mimeTypeRecord = new MIMEType("text/plain;charset=US-ASCII");
  }

  // Return the structured data URL object
  return { mimeType: mimeTypeRecord, body };
};
