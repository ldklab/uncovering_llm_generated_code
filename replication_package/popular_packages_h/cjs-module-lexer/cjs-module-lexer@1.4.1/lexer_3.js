let source, pos, end;
let openTokenDepth, templateDepth, lastTokenPos, lastSlashWasDivision,
    templateStack, templateStackDepth, openTokenPosStack, openClassPosStack,
    nextBraceIsClass, starExportMap, lastStarExportSpecifier,
    _exports, unsafeGetters, reexports;

function resetState() {
  openTokenDepth = 0;
  templateDepth = -1;
  lastTokenPos = -1;
  lastSlashWasDivision = false;
  templateStack = new Array(1024);
  templateStackDepth = 0;
  openTokenPosStack = new Array(1024);
  openClassPosStack = new Array(1024);
  nextBraceIsClass = false;
  starExportMap = Object.create(null);
  lastStarExportSpecifier = null;
  _exports = new Set();
  unsafeGetters = new Set();
  reexports = new Set();
}

// Token Types
const Import = 0;
const ExportAssign = 1;
const ExportStar = 2;

function parseCJS(source, name = '@') {
  resetState();
  try {
    parseSource(source);
  } catch (e) {
    e.message += `\n  at ${name}:${source.slice(0, pos).split('\n').length}:${pos - source.lastIndexOf('\n', pos - 1)}`;
    e.loc = pos;
    throw e;
  }
  const result = {
    exports: [..._exports].filter(expt => expt !== undefined && !unsafeGetters.has(expt)),
    reexports: [...reexports].filter(reexpt => reexpt !== undefined)
  };
  resetState();
  return result;
}

function decode(str) {
  if (str[0] === '"' || str[0] === '\'') {
    try {
      const decoded = (0, eval)(str);
      for (let i = 0; i < decoded.length; i++) {
        const surrogatePrefix = decoded.charCodeAt(i) & 0xFC00;
        if (surrogatePrefix < 0xD800) continue;
        else if (surrogatePrefix === 0xD800) {
          if ((decoded.charCodeAt(++i) & 0xFC00) !== 0xDC00)
            return;
        } else {
          return;
        }
      }
      return decoded;
    } catch {}
  } else {
    return str;
  }
}

function parseSource(cjsSource) {
  source = cjsSource;
  pos = -1;
  end = source.length - 1;
  let ch = 0;

  // Handle Shebang (#!)
  if (source.charCodeAt(0) === 35 && source.charCodeAt(1) === 33) {
    if (source.length === 2) return true;
    pos += 2;
    while (pos++ < end) {
      ch = source.charCodeAt(pos);
      if (ch === 10 || ch === 13) break;
    }
  }

  while (pos++ < end) {
    ch = source.charCodeAt(pos);

    if (ch === 32 || ch < 14 && ch > 8) continue;

    if (openTokenDepth === 0) {
      switch (ch) {
        case 105: // 'i'
          if (source.startsWith('mport', pos + 1) && keywordStart(pos))
            throwIfImportStatement();
          lastTokenPos = pos;
          continue;
        case 114: // 'r'
          if (tryParseRequire(Import) && keywordStart(pos))
            tryBacktrackAddStarExportBinding(pos - 1);
          lastTokenPos = pos;
          continue;
        case 95: // '_'
          if (source.startsWith('interopRequireWildcard', pos + 1) && (keywordStart(pos) || source.charCodeAt(pos - 1) === 46)) {
            if (parseInteroperableRequire()) continue;
          } else if (source.startsWith('_export', pos + 1) && (keywordStart(pos) || source.charCodeAt(pos - 1) === 46)) {
            pos += 8;
            if (source.startsWith('Star', pos)) pos += 4;
            if (source.charCodeAt(pos) === 40) tryParseExportsDotAssign(ExportStar);
          }
          lastTokenPos = pos;
          continue;
      }
    }

    switch (ch) {
      case 101: // 'e'
        if (source.startsWith('xport', pos + 1) && keywordStart(pos)) {
          if (source.charCodeAt(pos + 6) === 115)
            tryParseExportsDotAssign(false);
          else if (openTokenDepth === 0)
            throwIfExportStatement();
        }
        break;
      case 99: // 'c'
        if (keywordStart(pos) && source.startsWith('lass', pos + 1) && isBrOrWs(source.charCodeAt(pos + 5)))
          nextBraceIsClass = true;
        break;
      case 109: // 'm'
        if (source.startsWith('odule', pos + 1) && keywordStart(pos))
          tryParseModuleExportsDotAssign();
        break;
      case 79: // 'O'
        if (source.startsWith('bject', pos + 1) && keywordStart(pos))
          tryParseObjectDefineOrKeys(openTokenDepth === 0);
        break;
      default:
        handleBracesAndComments(ch);
    }
    lastTokenPos = pos;
  }

  if (templateDepth !== -1) throw new Error('Unterminated template.');
  if (openTokenDepth) throw new Error('Unterminated braces.');
}

function parseInteroperableRequire() {
  const startPos = pos;
  pos += 23;
  if (source.charCodeAt(pos) === 40) {
    pos++;
    openTokenPosStack[openTokenDepth++] = lastTokenPos;
    if (tryParseRequire(Import) && keywordStart(startPos)) {
      tryBacktrackAddStarExportBinding(startPos - 1);
    }
  }
}

function handleBracesAndComments(ch) {
  switch (ch) {
    case 40: // '('
      openTokenPosStack[openTokenDepth++] = lastTokenPos;
      break;
    case 41: // ')'
      if (openTokenDepth === 0) throw new Error('Unexpected closing bracket.');
      openTokenDepth--;
      break;
    case 123: // '{'
      openClassPosStack[openTokenDepth] = nextBraceIsClass;
      nextBraceIsClass = false;
      openTokenPosStack[openTokenDepth++] = lastTokenPos;
      break;
    case 125: // '}'
      if (openTokenDepth === 0) throw new Error('Unexpected closing brace.');
      if (openTokenDepth-- === templateDepth) {
        templateDepth = templateStack[--templateStackDepth];
        templateString();
      } else {
        if (templateDepth !== -1 && openTokenDepth < templateDepth) throw new Error('Unexpected closing brace.');
      }
      break;
    case 39: // '\''
    case 34: // '"'
      stringLiteral(ch);
      break;
    case 47: {
      handleForwardSlash(ch);
      break;
    }
    case 96: // '`'
      templateString();
      break;
  }
}

function handleForwardSlash() {
  const next_ch = source.charCodeAt(pos + 1);
  if (next_ch === 47) {
    lineComment();
    return;
  }
  if (next_ch === 42) {
    blockComment();
    return;
  }
  handleRegexOrDivision();
}

function handleRegexOrDivision() {
  const lastToken = source.charCodeAt(lastTokenPos);
  if (isExpressionPunctuator(lastToken) &&
      !(lastToken === 46 && (source.charCodeAt(lastTokenPos - 1) >= 48 && source.charCodeAt(lastTokenPos - 1) <= 57)) &&
      !(lastToken === 43 && source.charCodeAt(lastTokenPos - 1) === 43) && !(lastToken === 45 && source.charCodeAt(lastTokenPos - 1) === 45) ||
      lastToken === 41 && isParenKeyword(openTokenPosStack[openTokenDepth]) ||
      lastToken === 125 && (isExpressionTerminator(openTokenPosStack[openTokenDepth]) || openClassPosStack[openTokenDepth]) ||
      lastToken === 47 && lastSlashWasDivision ||
      isExpressionKeyword(lastTokenPos) ||
      !lastToken) {
    regularExpression();
    lastSlashWasDivision = false;
  } else {
    lastSlashWasDivision = true;
  }
}

function tryBacktrackAddStarExportBinding(bPos) {
  while (source.charCodeAt(bPos) === 32 && bPos >= 0) bPos--;
  if (source.charCodeAt(bPos) === 61) {
    validateAndAddStarExport(bPos);
  }
}

function validateAndAddStarExport(bPos) {
  bPos--;
  while (source.charCodeAt(bPos) === 32 && bPos >= 0) bPos--;
  let codePoint;
  const id_end = bPos;
  let identifierStart = false;
  while ((codePoint = codePointAtLast(bPos)) && bPos >= 0) {
    if (codePoint === 92) return;
    if (!isIdentifierChar(codePoint, true)) break;
    identifierStart = isIdentifierStart(codePoint, true);
    bPos -= codePointLen(codePoint);
  }
  if (identifierStart && source.charCodeAt(bPos) === 32) {
    addStarExport(bPos, id_end);
  }
}

function addStarExport(bPos, id_end) {
  const starExportId = source.slice(bPos + 1, id_end + 1);
  while (source.charCodeAt(bPos) === 32 && bPos >= 0) bPos--;
  switch (source.charCodeAt(bPos)) {
    case 114: // 'r'
      if (!source.startsWith('va', bPos - 2)) return;
      break;
    case 116: // 't'
      if (!source.startsWith('le', bPos - 2) && !source.startsWith('cons', bPos - 4)) return;
      break;
    default: return;
  }
  starExportMap[starExportId] = lastStarExportSpecifier;
}

// Parse Object.hasOwnProperty calls
function tryParseObjectHasOwnProperty(it_id) {
  ch = commentWhitespace();
  if (!parseObjectPrototype()) return false;
  return validateObjectCall(it_id);
}

function parseObjectPrototype() {
  let ch = parseInitialObject();
  if (ch !== 46) return false;
  pos++;
  ch = commentWhitespace();
  if (ch === 112) {
    if (!source.startsWith('rototype', pos + 1)) return false;
    pos += 9;
    ch = commentWhitespace();
    if (ch !== 46) return false;
    pos++;
  }
  return parseObjectHasOwn(ch);
}

function parseInitialObject() {
  if (source.startsWith('bject', pos + 1)) {
    pos += 6;
    return commentWhitespace();
  }
  return false;
}

function parseObjectHasOwn(ch) {
  ch = commentWhitespace();
  if (ch !== 104 || !source.startsWith('asOwnProperty', pos + 1)) return false;
  pos += 14;
  ch = commentWhitespace();
  if (ch !== 46) return false;
  pos += 4;
  return commentWhitespace();
}

function validateObjectCall(it_id) {
  let ch = commentWhitespace();
  if (ch === 40) {
    pos++;
    ch = commentWhitespace();
    if (!identifier()) return false;
    ch = commentWhitespace();
    if (ch !== 44) return false;
    pos++;
    ch = commentWhitespace();
    if (!source.startsWith(it_id, pos)) return false;
    pos += it_id.length;
    ch = commentWhitespace();
    if (ch !== 41) return false;
    pos++;
    return true;
  }
  return false;
}

function tryParseObjectDefineOrKeys(keys) {
  pos += 6;
  let revertPos = pos - 1;
  let ch = commentWhitespace();
  if (parseDefineProperty(ch)) {
    executeDefineProperty();
    return;
  }
  pos = revertPos;
}

function parseDefineProperty(ch) {
  if (ch === 46) {
    pos++;
    ch = commentWhitespace();
    if (ch === 100 && source.startsWith('efineProperty', pos + 1)) {
      pos += 14;
      return true;
    }
  }
  return false;
}

function executeDefineProperty() {
  let expt;
  while (true) {
    if (!parseDefineBlock()) break;
    expt = executeDefineValue(expt);
    if (expt) _exports.add(decode(expt));
    break;
  }
}

function parseDefineBlock() {
  let ch = commentWhitespace();
  if (ch !== 40) return false;
  pos++;
  ch = commentWhitespace();
  if (!readExportsOrModuleDotExports(ch)) return false;
  ch = commentWhitespace();
  if (ch !== 44) return false;
  pos++;
  return true;
}

function executeDefineValue(expt) {
  let ch = commentWhitespace();
  if (ch === 39 || ch === 34) {
    const exportPos = pos;
    stringLiteral(ch);
    expt = source.slice(exportPos, ++pos);
    ch = commentWhitespace();
    if (ch !== 44) return;
    pos++;
    ch = commentWhitespace();
    if (ch !== 123) return;
    pos++;
    ch = commentWhitespace();
    if (parseDefineValueExpression(ch)) return expt;
  }
}

function parseDefineValueExpression(ch) {
  if (ch === 101) {
    if (!source.startsWith('numerable', pos + 1)) return false;
    pos += 10;
    ch = commentWhitespace();
    if (ch !== 58) return false;
    pos++;
    ch = commentWhitespace();
    if (ch !== 116 || !source.startsWith('rue', pos + 1)) return false;
    pos += 4;
    ch = commentWhitespace();
    if (ch !== 44) return false;
    pos++;
    ch = commentWhitespace();
    if (parseDefineFunction(ch)) return true;
  }
}

function parseDefineFunction(ch) {
  if (ch === 103) {
    if (!source.startsWith('et', pos + 1)) return false;
    pos += 3;
    ch = commentWhitespace();
    if (ch === 58) {
      pos++;
      ch = commentWhitespace();
      if (ch !== 102) return false;
      if (!source.startsWith('unction', pos + 1)) return false;
      pos += 8;
      let lastPos = pos;
      ch = commentWhitespace();
      if (ch !== 40 && (lastPos === pos || !identifier())) return false;
      ch = commentWhitespace();
    }
    return parseDefineReturn(ch);
  }
}

function parseDefineReturn(ch) {
  if (ch === 40) {
    pos++;
    ch = commentWhitespace();
    if (ch !== 41) return false;
    pos++;
    ch = commentWhitespace();
    if (ch !== 123) return false;
    pos++;
    ch = commentWhitespace();
    if (ch !== 114 || !source.startsWith('eturn', pos + 1)) return false;
    pos += 6;
    ch = commentWhitespace();
    if (!identifier()) return false;
    ch = commentWhitespace();
    if (ch === 46 || ch === 91) {
      pos++;
      if (ch === 91) parseDefineReturnBracket(ch);
      ch = commentWhitespace();
    }
    if (ch === 59) {
      pos++;
      ch = commentWhitespace();
    }
    if (ch === 125) {
      pos++;
      ch = commentWhitespace();
      if (ch === 44) {
        pos++;
        ch = commentWhitespace();
      }
      if (ch !== 125) return false;
      pos++;
      ch = commentWhitespace();
      if (ch !== 41) return false;
      _exports.add(decode(expt));
      return true;
    }
  }
}

function parseDefineReturnBracket(ch) {
  ch = commentWhitespace();
  if (ch === 39 || ch === 34) stringLiteral(ch);
  pos++;
  ch = commentWhitespace();
  if (ch !== 93) return false;
  pos++;
}

function readExportsOrModuleDotExports(ch) {
  const revertPos = pos;
  if (parseExportsOrModuleStart(ch)) {
    ch = commentWhitespace();
    if (ch !== 46) {
      pos = revertPos;
      return false;
    }
    pos++;
    ch = commentWhitespace();
  }
  return parseExports(ch, revertPos);
}

function parseExportsOrModuleStart(ch) {
  if (ch === 109 && source.startsWith('odule', pos + 1)) {
    pos += 6;
    return true;
  }
  return false;
}

function parseExports(ch, revertPos) {
  if (ch === 101 && source.startsWith('xports', pos + 1)) {
    pos += 7;
    return true;
  }
  pos = revertPos;
  return false;
}

function tryParseModuleExportsDotAssign() {
  pos += 6;
  const revertPos = pos - 1;
  let ch = commentWhitespace();
  if (ch === 46) {
    pos++;
    ch = commentWhitespace();
    if (ch === 101 && source.startsWith('xports', pos + 1)) {
      tryParseExportsDotAssign(true);
      return;
    }
  }
  pos = revertPos;
}

function tryParseExportsDotAssign(assign) {
  pos += 7;
  const revertPos = pos - 1;
  let ch = commentWhitespace();
  switch (ch) {
    case 46: // '.'
      parseDotAssignment(revertPos);
      break;
    case 91: // '['
      parseBracketAssignment(revertPos);
      break;
    case 61: // '='
      if (assign) {
        if (reexports.size) reexports = new Set();
        pos++;
        ch = commentWhitespace();
        if (ch === 123) {
          tryParseLiteralExports();
          return;
        }
        if (ch === 114) tryParseRequire(ExportAssign);
      }
  }
  pos = revertPos;
}

function parseDotAssignment(revertPos) {
  pos++;
  let ch = commentWhitespace();
  const startPos = pos;
  if (identifier()) {
    const endPos = pos;
    ch = commentWhitespace();
    if (ch === 61) {
      _exports.add(decode(source.slice(startPos, endPos)));
    }
  }
}

function parseBracketAssignment(revertPos) {
  pos++;
  let ch = commentWhitespace();
  if (ch === 39 || ch === 34) {
    const startPos = pos;
    stringLiteral(ch);
    const endPos = ++pos;
    ch = commentWhitespace();
    if (ch !== 93) return;
    pos++;
    ch = commentWhitespace();
    if (ch !== 61) return;
    pos++;
    _exports.add(decode(source.slice(startPos, endPos)));
  }
}

function tryParseRequire(requireType) {
  const revertPos = pos;
  if (source.startsWith('equire', pos + 1)) {
    pos += 7;
    let ch = commentWhitespace();
    if (ch === 40) {
      pos++;
      ch = commentWhitespace();
      const reexportStart = pos;
      if (ch === 39 || ch === 34) {
        stringLiteral(ch);
        const reexportEnd = ++pos;
        ch = commentWhitespace();
        if (ch === 41) {
          addReexportRequire(requireType, reexportStart, reexportEnd);
          return true;
        }
      }
    }
    pos = revertPos;
  }
  return false;
}

function addReexportRequire(requireType, reexportStart, reexportEnd) {
  switch (requireType) {
    case ExportAssign:
      reexports.add(decode(source.slice(reexportStart, reexportEnd)));
      break;
    case ExportStar:
      reexports.add(decode(source.slice(reexportStart, reexportEnd)));
      break;
    default:
      lastStarExportSpecifier = decode(source.slice(reexportStart, reexportEnd));
  }
}

function tryParseLiteralExports() {
  const revertPos = pos - 1;
  while (pos++ < end) {
    let ch = commentWhitespace();
    const startPos = pos;
    if (identifier()) {
      const endPos = pos;
      ch = commentWhitespace();
      if (ch === 58) {
        pos++;
        ch = commentWhitespace();
        if (!identifier()) {
          pos = revertPos;
          return;
        }
        ch = source.charCodeAt(pos);
      }
      _exports.add(decode(source.slice(startPos, endPos)));
    } else if (ch === 46 && source.startsWith('..', pos + 1)) {
      pos += 3;
      if (source.charCodeAt(pos) === 114 && tryParseRequire(ExportAssign)) {
        pos++;
      } else if (!identifier()) {
        pos = revertPos;
        return;
      }
      ch = commentWhitespace();
    } else if (ch === 39 || ch === 34) {
      const startPos = pos;
      stringLiteral(ch);
      const endPos = ++pos;
      ch = commentWhitespace();
      if (ch === 58) {
        pos++;
        ch = commentWhitespace();
        if (!identifier()) {
          pos = revertPos;
          return;
        }
        ch = source.charCodeAt(pos);
        _exports.add(decode(source.slice(startPos, endPos)));
      }
    } else {
      pos = revertPos;
      return;
    }
    if (ch === 125) return;
    if (ch !== 44) {
      pos = revertPos;
      return;
    }
  }
}

const initPromise = Promise.resolve();

module.exports.init = () => initPromise;
module.exports.initSync = () => {};
module.exports.parse = parseCJS;

// Supporting functions and variables
function throwIfImportStatement() {
  const startPos = pos;
  pos += 6;
  const ch = commentWhitespace();
  switch (ch) {
    case 40:
      openTokenPosStack[openTokenDepth++] = startPos;
      break;
    case 46:
      throw esmSyntaxErr('Unexpected import.meta in CJS module.');
    default:
      if (pos === startPos + 6) break;
    case 34:
    case 39:
    case 123:
    case 42:
      if (openTokenDepth !== 0) {
        pos--;
        return;
      }
      throw esmSyntaxErr('Unexpected import statement in CJS module.');
  }
}

function throwIfExportStatement() {
  pos += 6;
  const curPos = pos;
  const ch = commentWhitespace();
  if (pos === curPos && !isPunctuator(ch)) return;
  throw esmSyntaxErr('Unexpected export statement in CJS module.');
}

function esmSyntaxErr(msg) {
  return Object.assign(new Error(msg), { code: 'ERR_LEXER_ESM_SYNTAX' });
}

function identifier() {
  let ch = source.codePointAt(pos);
  if (!isIdentifierStart(ch, true) || ch === '\\')
    return false;
  pos += codePointLen(ch);
  while (ch = source.codePointAt(pos)) {
    if (isIdentifierChar(ch, true)) {
      pos += codePointLen(ch);
    } else if (ch === '\\') {
      return false;
    } else {
      break;
    }
  }
  return true;
}

function codePointLen(ch) {
  if (ch < 0x10000) return 1;
  return 2;
}

function codePointAtLast(bPos) {
  const ch = source.charCodeAt(bPos);
  if ((ch & 0xFC00) === 0xDC00)
    return (((source.charCodeAt(bPos - 1) & 0x3FF) << 10) | (ch & 0x3FF)) + 0x10000;
  return ch;
}

function commentWhitespace() {
  let ch;
  do {
    ch = source.charCodeAt(pos);
    if (ch === 47) {
      const next_ch = source.charCodeAt(pos + 1);
      if (next_ch === 47)
        lineComment();
      else if (next_ch === 42)
        blockComment();
      else
        return ch;
    } else if (!isBrOrWs(ch)) {
      return ch;
    }
  } while (pos++ < end);
  return ch;
}

function templateString() {
  while (pos++ < end) {
    const ch = source.charCodeAt(pos);
    if (ch === 36 && source.charCodeAt(pos + 1) === 123) {
      pos++;
      templateStack[templateStackDepth++] = templateDepth;
      templateDepth = ++openTokenDepth;
      return;
    }
    if (ch === 96)
      return;
    if (ch === 92)
      pos++;
  }
  throw new Error('Unterminated template.');
}

function blockComment() {
  pos++;
  while (pos++ < end) {
    const ch = source.charCodeAt(pos);
    if (ch === 42 && source.charCodeAt(pos + 1) === 47) {
      pos++;
      return;
    }
  }
}

function lineComment() {
  while (pos++ < end) {
    const ch = source.charCodeAt(pos);
    if (ch === 10 || ch === 13)
      return;
  }
}

function stringLiteral(quote) {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === quote)
      return;
    if (ch === 92) {
      ch = source.charCodeAt(++pos);
      if (ch === 13 && source.charCodeAt(pos + 1) === 10)
        pos++;
    }
    else if (isBr(ch))
      break;
  }
  throw new Error('Unterminated string.');
}

function regexCharacterClass() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 93)
      return ch;
    if (ch === 92)
      pos++;
    else if (ch === 10 || ch === 13)
      break;
  }
  throw new Error('Syntax error reading regular expression class.');
}

function regularExpression() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 47)
      return;
    if (ch === 91)
      ch = regexCharacterClass();
    else if (ch === 92)
      pos++;
    else if (ch === 10 || ch === 13)
      break;
  }
  throw new Error('Syntax error reading regular expression.');
}

// Character checks
function isBr(c) {
  return c === 13 || c === 10;
}

function isBrOrWs(c) {
  return c > 8 && c < 14 || c === 32 || c === 160;
}

function isBrOrWsOrPunctuatorNotDot(c) {
  return c > 8 && c < 14 || c === 32 || c === 160 || isPunctuator(c) && c !== 46;
}

function keywordStart(pos) {
  return pos === 0 || isBrOrWsOrPunctuatorNotDot(source.charCodeAt(pos - 1));
}

function isExpressionKeyword(pos) {
  switch (source.charCodeAt(pos)) {
    case 100:
      return checkExpressionKeywordForD(pos);
    case 101:
      return checkExpressionKeywordForE(pos);
    case 102:
      return checkExpressionKeywordForF(pos);
    case 110:
      return checkExpressionKeywordForN(pos);
    case 111:
      return checkExpressionKeywordForO(pos);
    case 114:
      return checkExpressionKeywordForR(pos);
    case 116:
      return checkExpressionKeywordForT(pos);
    case 119:
      return checkExpressionKeywordForW(pos);
  }
  return false;
}

function checkExpressionKeywordForD(pos) {
  switch (source.charCodeAt(pos - 1)) {
    case 105:
      return readPrecedingKeyword(pos - 2, 'vo');
    case 108:
      return readPrecedingKeyword(pos - 2, 'yie');
    default:
      return false;
  }
}

function checkExpressionKeywordForE(pos) {
  switch (source.charCodeAt(pos - 1)) {
    case 115:
      switch (source.charCodeAt(pos - 2)) {
        case 108:
          return readPrecedingKeyword1(pos - 3, 101);
        case 97:
          return readPrecedingKeyword1(pos - 3, 99);
        default:
          return false;
      }
    case 116:
      return readPrecedingKeyword(pos - 2, 'dele');
    default:
      return false;
  }
}

function checkExpressionKeywordForF(pos) {
  if (source.charCodeAt(pos - 1) !== 111 || source.charCodeAt(pos - 2) !== 101)
    return false;
  switch (source.charCodeAt(pos - 3)) {
    case 99:
      return readPrecedingKeyword(pos - 4, 'instan');
    case 112:
      return readPrecedingKeyword(pos - 4, 'ty');
    default:
      return false;
  }
}

function checkExpressionKeywordForN(pos) {
  return readPrecedingKeyword1(pos - 1, 105) || readPrecedingKeyword(pos - 1, 'retur');
}

function checkExpressionKeywordForO(pos) {
  return readPrecedingKeyword1(pos - 1, 100);
}

function checkExpressionKeywordForR(pos) {
  return readPrecedingKeyword(pos - 1, 'debugge');
}

function checkExpressionKeywordForT(pos) {
  return readPrecedingKeyword(pos - 1, 'awai');
}

function checkExpressionKeywordForW(pos) {
  switch (source.charCodeAt(pos - 1)) {
    case 101:
      return readPrecedingKeyword1(pos - 2, 110);
    case 111:
      return readPrecedingKeyword(pos - 2, 'thr');
    default:
      return false;
  }
}

function isParenKeyword(curPos) {
  return source.charCodeAt(curPos) === 101 && source.startsWith('whil', curPos - 4) ||
      source.charCodeAt(curPos) === 114 && source.startsWith('fo', curPos - 2) ||
      source.charCodeAt(curPos - 1) === 105 && source.charCodeAt(curPos) === 102;
}

function isPunctuator(ch) {
  return ch === 33 || ch === 37 || ch === 38 ||
    ch > 39 && ch < 48 || ch > 57 && ch < 64 ||
    ch === 91 || ch === 93 || ch === 94 ||
    ch > 122 && ch < 127;
}

function isExpressionPunctuator(ch) {
  return ch === 33 || ch === 37 || ch === 38 ||
    ch > 39 && ch < 47 && ch !== 41 || ch > 57 && ch < 64 ||
    ch === 91 || ch === 94 || ch > 122 && ch < 127 && ch !== 125;
}

function isExpressionTerminator(curPos) {
  switch (source.charCodeAt(curPos)) {
    case 62:
      return source.charCodeAt(curPos - 1) === 61;
    case 59:
    case 41:
      return true;
    case 104:
      return source.startsWith('catc', curPos - 4);
    case 121:
      return source.startsWith('finall', curPos - 6);
    case 101:
      return source.startsWith('els', curPos - 3);
  }
  return false;
}

// Identifier validation functions (AcornJS derived)
let nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08c7\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9ffc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7bf\ua7c2-\ua7ca\ua7f5-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc"
let nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf\u1ac0\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f"

const nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
const nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

const astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 349, 41, 7, 1, 79, 28, 11, 0, 9, 21, 107, 20, 28, 22, 13, 52, 76, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 230, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 35, 56, 264, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 190, 0, 80, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 689, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 43, 8, 8952, 286, 50, 2, 18, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 2357, 44, 11, 6, 17, 0, 370, 43, 1301, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42717, 35, 4148, 12, 221, 3, 5761, 15, 7472, 3104, 541, 1507, 4938];
const astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 370, 1, 154, 10, 176, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 19306, 9, 135, 4, 60, 6, 26, 9, 1014, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 262, 6, 10, 9, 419, 13, 1495, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

function isInAstralSet(code, set) {
  let pos = 0x10000;
  for (let i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) return false;
    pos += set[i + 1];
    if (pos >= code) return true;
  }
}

function isIdentifierStart(code, astral) {
  if (code < 65) return code === 36;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  if (astral === false) return false;
  return isInAstralSet(code, astralIdentifierStartCodes);
}

function isIdentifierChar(code, astral) {
  if (code < 48) return code === 36;
  if (code < 58) return true;
  if (code < 65) return false;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  if (astral === false) return false;
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}
