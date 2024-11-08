let source, pos, end;
let openTokenDepth,
  templateDepth,
  lastTokenPos,
  lastSlashWasDivision,
  templateStack,
  templateStackDepth,
  openTokenPosStack,
  openClassPosStack,
  nextBraceIsClass,
  starExportMap,
  lastStarExportSpecifier,
  exportsSet,
  unsafeGetters,
  reexportsSet;

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

  exportsSet = new Set();
  unsafeGetters = new Set();
  reexportsSet = new Set();
}

const ImportType = Object.freeze({ Import: 0, ExportAssign: 1, ExportStar: 2 });

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
    exports: [...exportsSet].filter(expt => expt !== undefined && !unsafeGetters.has(expt)),
    reexports: [...reexportsSet].filter(reexpt => reexpt !== undefined)
  };
  resetState();
  return result;
}

function decode(str) {
  if (str[0] === '"' || str[0] === '\'') {
    try {
      const decoded = eval(str);
      for (let i = 0; i < decoded.length; i++) {
        const surrogatePrefix = decoded.charCodeAt(i) & 0xFC00;
        if (surrogatePrefix < 0xD800) continue;
        else if (surrogatePrefix === 0xD800) {
          if ((decoded.charCodeAt(++i) & 0xFC00) !== 0xDC00) return;
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
  if (source.charCodeAt(0) === 35 && source.charCodeAt(1) === 33) {
    if (source.length === 2) return true;
    pos += 2;
    movePosToEndOfLine();
  }

  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (isWhitespace(ch)) continue;

    if (openTokenDepth === 0) {
      if (parseTopLevelConstruct(ch)) continue;
    }

    parseNestedConstruct(ch);
    lastTokenPos = pos;
  }

  if (templateDepth !== -1) throw new Error('Unterminated template.');
  if (openTokenDepth) throw new Error('Unterminated braces.');
}

function movePosToEndOfLine() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 10 || ch === 13) break;
  }
}

function parseTopLevelConstruct(ch) {
  switch (ch) {
    case 105: // 'i'
      if (source.startsWith('mport', pos + 1) && keywordStart(pos)) throwIfImportStatement();
      lastTokenPos = pos;
      return true;
    case 114: // 'r'
      const startPos = pos;
      if (tryParseRequire(ImportType.Import) && keywordStart(startPos)) tryBacktrackAddStarExportBinding(startPos - 1);
      lastTokenPos = pos;
      return true;
    case 95: // '_'
      if (tryParseInteropRequire() || tryParseExportStar()) return true;
  }
  return false;
}

function parseNestedConstruct(ch) {
  switch (ch) {
    case 101: // 'e'
      if (source.startsWith('xport', pos + 1) && keywordStart(pos)) {
        if (source.charCodeAt(pos + 6) === 115) tryParseExportsDotAssign(false);
        else if (openTokenDepth === 0) throwIfExportStatement();
      }
      break;
    case 99: // 'c'
      if (keywordStart(pos) && source.startsWith('lass', pos + 1) && isBrOrWs(source.charCodeAt(pos + 5))) nextBraceIsClass = true;
      break;
    case 109: // 'm'
      if (source.startsWith('odule', pos + 1) && keywordStart(pos)) tryParseModuleExportsDotAssign();
      break;
    case 79: // 'O'
      if (source.startsWith('bject', pos + 1) && keywordStart(pos)) tryParseObjectDefineOrKeys(openTokenDepth === 0);
      break;
    case 40: // '('
      openTokenPosStack[openTokenDepth++] = lastTokenPos;
      break;
    case 41: // ')'
      if (openTokenDepth === 0) throw new Error('Unexpected closing bracket.');
      openTokenDepth--;
      break;
    case 123: // '{'
      handleOpenBrace();
      break;
    case 125: // '}'
      handleCloseBrace();
      break;
    case 39: // "'"
    case 34: // '"'
      stringLiteral(ch);
      break;
    case 47: // '/'
      handleSlash();
      break;
    case 96: // '`'
      templateString();
      break;
  }
}

function handleOpenBrace() {
  openClassPosStack[openTokenDepth] = nextBraceIsClass;
  nextBraceIsClass = false;
  openTokenPosStack[openTokenDepth++] = lastTokenPos;
}

function handleCloseBrace() {
  if (openTokenDepth === 0) throw new Error('Unexpected closing brace.');
  if (openTokenDepth-- === templateDepth) {
    templateDepth = templateStack[--templateStackDepth];
    templateString();
  } else if (templateDepth !== -1 && openTokenDepth < templateDepth) {
    throw new Error('Unexpected closing brace.');
  }
}

function handleSlash() {
  const next_ch = source.charCodeAt(pos + 1);
  if (next_ch === 47) {
    lineComment(); 
    return;
  } else if (next_ch === 42) {
    blockComment(); 
    return;
  }
  lastSlashWasDivision = determineSlashType();
}

function determineSlashType() {
  const lastToken = source.charCodeAt(lastTokenPos);
  if (isExpressionPunctuator(lastToken) &&
    !(lastToken === 46 && isDigit(source.charCodeAt(lastTokenPos - 1))) &&
    !(isPlusPlusOrMinusMinus(lastToken)) ||
    isParenOrBraceKeyword(lastToken) ||
    openClassPosStack[openTokenDepth]) {
    regularExpression();
    return false;
  }
  return true;
}

function annotationHelper(type, parseFn) {
  return function () {
    // some initial setup
    parseFn();
    // reset or any other operations
    resetState();
  };
}

const parseCJSWithReset = annotationHelper(null, parseCJS);

module.exports.init = () => Promise.resolve();
module.exports.initSync = () => {};
module.exports.parse = parseCJSWithReset;

// Utility and needful code extractions

function isWhitespace(ch) {
  return ch === 32 || (ch > 8 && ch < 14);
}

function isPlusPlusOrMinusMinus(ch) {
  return (ch === 43 && source.charCodeAt(lastTokenPos - 1) === 43) || (ch === 45 && source.charCodeAt(lastTokenPos - 1) === 45);
}

function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}

function parseInteropRequire() {
  if (source.startsWith('interopRequireWildcard', pos + 1) && (keywordStart(pos) || source.charCodeAt(pos - 1) === 46)) {
    const startPos = pos;
    pos += 23;
    if (source.charCodeAt(pos) === 40) {
      pos++;
      openTokenPosStack[openTokenDepth++] = lastTokenPos;
      if (tryParseRequire(ImportType.Import) && keywordStart(startPos)) {
        tryBacktrackAddStarExportBinding(startPos - 1);
      }
    }
    lastTokenPos = pos;
    return true;
  }
  return false;
}

function parseExportStar() {
  if (source.startsWith('_export', pos + 1) && (keywordStart(pos) || source.charCodeAt(pos - 1) === 46)) {
    pos += 8;
    if (source.startsWith('Star', pos)) pos += 4;
    if (source.charCodeAt(pos) === 40) {
      openTokenPosStack[openTokenDepth++] = lastTokenPos;
      if (source.charCodeAt(++pos) === 114) tryParseRequire(ImportType.ExportStar);
    }
    lastTokenPos = pos;
    return true;
  }
  return false;
}

function stringLiteral(quote) {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === quote) return;
    if (ch === 92) {
      ch = source.charCodeAt(++pos);
      if (ch === 13 && source.charCodeAt(pos + 1) === 10) pos++;
    } else if (isBr(ch)) {
      break;
    }
  }
  throw new Error('Unterminated string.');
}

function lineComment() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 10 || ch === 13) return;
  }
}

function blockComment() {
  pos++;
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 42 && source.charCodeAt(pos + 1) === 47) {
      pos++;
      return;
    }
  }
}

function regularExpression() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 47) return;
    if (ch === 91) ch = regexCharacterClass();
    else if (ch === 92) pos++;
    else if (ch === 10 || ch === 13) break;
  }
  throw new Error('Syntax error reading regular expression.');
}

function regexCharacterClass() {
  while (pos++ < end) {
    let ch = source.charCodeAt(pos);
    if (ch === 93) return ch;
    if (ch === 92) pos++;
    else if (ch === 10 || ch === 13) break;
  }
  throw new Error('Syntax error reading regular expression class.');
}
