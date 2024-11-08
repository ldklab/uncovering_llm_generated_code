"use strict";
const MIMEType = require("whatwg-mimetype");
const { parseURL, serializeURL, percentDecodeString } = require("whatwg-url");
const { stripLeadingAndTrailingASCIIWhitespace, isomorphicDecode, forgivingBase64Decode } = require("./utils.js");

function parseDataUrl(stringInput) {
  const urlRecord = parseURL(stringInput);

  if (!urlRecord) {
    return null;
  }

  return parseFromURLRecord(urlRecord);
}

function parseFromURLRecord(urlRecord) {
  if (urlRecord.scheme !== "data") {
    return null;
  }

  const input = serializeURL(urlRecord, true).slice("data:".length);

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
  const encodedBody = input.slice(position);
  let body = percentDecodeString(encodedBody);

  const mimeTypeBase64Match = /(.*); *[Bb][Aa][Ss][Ee]64$/u.exec(mimeType);
  if (mimeTypeBase64Match) {
    const stringBody = isomorphicDecode(body);
    body = forgivingBase64Decode(stringBody);

    if (!body) {
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
  } catch {
    mimeTypeRecord = new MIMEType("text/plain;charset=US-ASCII");
  }

  return {
    mimeType: mimeTypeRecord,
    body
  };
}

module.exports = parseDataUrl;
module.exports.fromURLRecord = parseFromURLRecord;
