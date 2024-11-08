"use strict";

function InvalidCharacterError(message) {
  this.message = message;
}
InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = "InvalidCharacterError";

var base64Decode =
  (typeof window !== "undefined" && window.atob && window.atob.bind(window)) ||
  function (input) {
    var str = String(input).replace(/=+$/, "");
    if (str.length % 4 === 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    var output = "";
    for (var bc = 0, bs, buffer, i = 0; (buffer = str.charAt(i++)); ~buffer &&
      (bs = bc % 4 ? 64 * bs + buffer : buffer, bc++ % 4)
      ? (output += String.fromCharCode(255 & bs >> (-2 * bc & 6)))
      : 0) {
      buffer = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(buffer);
    }
    return output;
  };

function base64UrlDecode(input) {
  var padded = input.replace(/-/g, "+").replace(/_/g, "/");
  switch (padded.length % 4) {
    case 0:
      break;
    case 2:
      padded += "==";
      break;
    case 3:
      padded += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  try {
    return decodeURIComponent(base64Decode(padded).replace(/(.)/g, function (match, p1) {
      var code = p1.charCodeAt(0).toString(16).toUpperCase();
      return "%" + (code.length < 2 ? "0" : "") + code;
    }));
  } catch (error) {
    return base64Decode(padded);
  }
}

function InvalidTokenError(message) {
  this.message = message;
}
InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = "InvalidTokenError";

function decodeToken(token, options = {}) {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified");
  }

  var partIndex = options.header === true ? 0 : 1;

  try {
    return JSON.parse(base64UrlDecode(token.split(".")[partIndex]));
  } catch (error) {
    throw new InvalidTokenError("Invalid token specified: " + error.message);
  }
}

const jwtDecode = decodeToken;
jwtDecode.default = decodeToken;
jwtDecode.InvalidTokenError = InvalidTokenError;

module.exports = jwtDecode;
//# sourceMappingURL=jwt-decode.cjs.js.map
