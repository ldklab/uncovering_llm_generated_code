// Assuming UMD loader pattern is not needed, and focusing on encoding and decoding implementation

const namedReferences = {
  xml: {
    entities: { "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&amp;": "&" },
    characters: { "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;", "&": "&amp;" }
  },
  html5: {
    entities: { "&quot;": '"', "&amp;": "&", "&lt;": "<", "&gt;": ">", "&apos;": "'" },
    characters: { '"': "&quot;", "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;" }
  }
};

const unicodeMap = {
  numericUnicodeMap: {
    128: 8364, 130: 8218, 131: 402, 132: 8222, 133: 8230,
    134: 8224, 135: 8225, 136: 710, 137: 8240, 138: 352,
    139: 8249, 140: 338, 142: 381, 145: 8216, 146: 8217,
    147: 8220, 148: 8221, 149: 8226, 150: 8211, 151: 8212,
    152: 732, 153: 8482, 154: 353, 155: 8250, 156: 339,
    158: 382, 159: 376
  }
};

const surrogatePairs = {
  fromCodePoint: String.fromCodePoint || function (codePoint) {
    return String.fromCharCode(
      Math.floor((codePoint - 65536) / 1024) + 55296,
      (codePoint - 65536) % 1024 + 56320
    );
  },
  getCodePoint: function (string, position) {
    if (String.prototype.codePointAt) {
      return string.codePointAt(position);
    } else {
      return (
        1024 * (string.charCodeAt(position) - 55296) +
        string.charCodeAt(position + 1) -
        56320 +
        65536
      );
    }
  }
};

function encode(str, options = {}) {
  const mode = options.mode || "specialChars";
  const numeric = options.numeric || "decimal";
  const level = options.level || "all";

  if (!str) {
    return "";
  }

  const charMap = namedReferences[level].characters;
  const isHexadecimal = numeric === "hexadecimal";

  return str.replace(/[<>'"&]/g, char => {
    return charMap[char] || `&#${isHexadecimal ? char.charCodeAt(0).toString(16) : char.charCodeAt(0)};`;
  });
}

function decode(str, options = {}) {
  const level = options.level || "all";
  const scope = options.scope || "body";
  const entities = namedReferences[level].entities;

  if (!str) {
    return "";
  }

  return str.replace(/&(?:#\d+|#x[\da-fA-F]+|[a-zA-Z]+);?/g, match => {
    if (match[1] === "#") {
      const isHexadecimal = match[2] === "x" || match[2] === "X";
      const code = parseInt(match.substr(isHexadecimal ? 3 : 2), isHexadecimal ? 16 : 10);
      return code > 65535 ? surrogatePairs.fromCodePoint(code) : String.fromCharCode(unicodeMap.numericUnicodeMap[code] || code);
    }
    return entities[match] || match;
  });
}

module.exports = { encode, decode };
