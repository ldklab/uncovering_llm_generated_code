"use strict";
const MIMEType = require("whatwg-mimetype");
const { parseURL, serializeURL, percentDecodeString } = require("whatwg-url");
const { stripLeadingAndTrailingASCIIWhitespace, isomorphicDecode, forgivingBase64Decode } = require("./utils.js");

function parseDataURL(stringInput) {
  const urlRecord = parseURL(stringInput);

  if (urlRecord === null) {
    return null;
  }

  return fromURLRecord(urlRecord);
}

function fromURLRecord(urlRecord) {
  if (urlRecord.scheme !== "data") {
    return null;
  }

  const serializedInput = serializeURL(urlRecord, true);
  const input = serializedInput.substring("data:".length);

  let position = 0;
  let mimeType = "";

  while (position < input.length && input[position] !== ",") {
    mimeType += input[position];
    position++;
  }

  mimeType = stripLeadingAndTrailingASCIIWhitespace(mimeType);

  if (position === input.length) {
    return null;
  }

  position++;
  const encodedBody = input.substring(position);
  let body = percentDecodeString(encodedBody);

  const mimeTypeBase64Match = /(.*); *[Bb][Aa][Ss][Ee]64$/u.exec(mimeType);
  if (mimeTypeBase64Match) {
    const decodedStringBody = isomorphicDecode(body);
    body = forgivingBase64Decode(decodedStringBody);

    if (body === null) {
      return null;
    }
    mimeType = mimeTypeBase64Match[1];
  }

  if (mimeType.startsWith(";")) {
    mimeType = `text/plain${mimeType}`;
  }

  let mimeTypeRecord;
  try {
    mimeTypeRecord = new MIMEType(mimeType);
  } catch (e) {
    mimeTypeRecord = new MIMEType("text/plain;charset=US-ASCII");
  }

  return {
    mimeType: mimeTypeRecord,
    body
  };
}

module.exports = parseDataURL;
module.exports.fromURLRecord = fromURLRecord;
