"use strict";

const MIMEType = require("whatwg-mimetype");
const { parseURL, serializeURL } = require("whatwg-url");
const {
  stripLeadingAndTrailingASCIIWhitespace,
  stringPercentDecode,
  isomorphicDecode,
  forgivingBase64Decode
} = require("./utils.js");

/**
 * Parses a string input as a data URL
 * @param {string} stringInput - The input string to be parsed as a URL.
 * @returns {object|null} - Returns an object with mimeType and body if a valid data URL, otherwise null.
 */
module.exports = stringInput => {
  const urlRecord = parseURL(stringInput);

  if (urlRecord === null) {
    return null; // Return null if parsing fails
  }

  return module.exports.fromURLRecord(urlRecord);
};

/**
 * Process a parsed URL record assumed to be a data URL
 * @param {object} urlRecord - The URL record.
 * @returns {object|null} - Returns an object with mimeType and body if the URL is a valid data URL, otherwise null.
 */
module.exports.fromURLRecord = urlRecord => {
  if (urlRecord.scheme !== "data") {
    return null; // Return null if the URL scheme is not "data"
  }

  // Extract and process the data portion of the URL
  const input = serializeURL(urlRecord, true).substring("data:".length);
  let position = 0;
  let mimeType = "";

  // Extract the mimeType from the input until a comma is encountered
  while (position < input.length && input[position] !== ",") {
    mimeType += input[position];
    ++position;
  }
  mimeType = stripLeadingAndTrailingASCIIWhitespace(mimeType);

  if (position === input.length) {
    return null; // Return null if there is no data after the mimeType
  }

  ++position; // Increment position to skip the comma
  const encodedBody = input.substring(position);

  // Decode the body from percent-encoding
  let body = stringPercentDecode(encodedBody);

  // Check if the mimeType indicates base64 encoding
  const mimeTypeBase64MatchResult = /(.*); *[Bb][Aa][Ss][Ee]64$/.exec(mimeType);
  if (mimeTypeBase64MatchResult) {
    const stringBody = isomorphicDecode(body);
    body = forgivingBase64Decode(stringBody);

    if (body === null) {
      return null; // Return null if base64 decoding fails
    }
    mimeType = mimeTypeBase64MatchResult[1];
  }

  // Append default mimeType if necessary
  if (mimeType.startsWith(";")) {
    mimeType = "text/plain" + mimeType;
  }

  let mimeTypeRecord;
  try {
    // Create MIMEType record, defaulting to text/plain if invalid
    mimeTypeRecord = new MIMEType(mimeType);
  } catch (e) {
    mimeTypeRecord = new MIMEType("text/plain;charset=US-ASCII");
  }

  return {
    mimeType: mimeTypeRecord,
    body
  };
};
