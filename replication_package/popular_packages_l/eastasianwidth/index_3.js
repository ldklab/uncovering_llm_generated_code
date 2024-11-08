// index.js
const eastAsianWidth = (char) => {
    const codePoint = char.codePointAt(0);

    if ((codePoint >= 0xFF01 && codePoint <= 0xFF60) || (codePoint >= 0xFFE0 && codePoint <= 0xFFE6)) return 'F';
    if ((codePoint >= 0xFF61 && codePoint <= 0xFFBE) || (codePoint >= 0xFFE8 && codePoint <= 0xFFEE)) return 'H';
    if ((codePoint >= 0x1100 && codePoint <= 0x115F) || (codePoint >= 0x2329 && codePoint <= 0x232A) ||
        (codePoint >= 0x2E80 && codePoint <= 0x303E) || (codePoint >= 0x3040 && codePoint <= 0xA4CF) ||
        (codePoint >= 0xAC00 && codePoint <= 0xD7A3) || (codePoint >= 0xF900 && codePoint <= 0xFAFF) ||
        (codePoint >= 0xFE10 && codePoint <= 0xFE19) || (codePoint >= 0xFE30 && codePoint <= 0xFE6F) ||
        (codePoint >= 0xFF00 && codePoint <= 0xFF60) || (codePoint >= 0xFFE0 && codePoint <= 0xFFE6) ||
        (codePoint >= 0x1F300 && codePoint <= 0x1F64F) || (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) ||
        (codePoint >= 0x20000 && codePoint <= 0x2FFFD) || (codePoint >= 0x30000 && codePoint <= 0x3FFFD)) return 'W';
    if ((codePoint >= 0x20 && codePoint <= 0x7E) || (codePoint >= 0xA2 && codePoint <= 0xA3) ||
        (codePoint >= 0xA5 && codePoint <= 0xA6) || [0x2030, 0x2032, 0x2033, 0x2103, 0x2109, 0x2113, 0x2116, 0x2121, 0x2122, 0x2126].includes(codePoint)) return 'Na';
    if ((codePoint >= 0x00A1 && codePoint <= 0x00A3) || (codePoint >= 0x00A5 && codePoint <= 0x00A7) ||
        (codePoint >= 0x00A9 && codePoint <= 0x00AB) || (codePoint >= 0x00AC && codePoint <= 0x00AE) ||
        (codePoint >= 0x00B0 && codePoint <= 0x00B4) || codePoint === 0x00B6 || codePoint === 0x00B7 ||
        (codePoint >= 0x00B8 && codePoint <= 0x00BB) || (codePoint >= 0x00BC && codePoint <= 0x00BE) || 
        (codePoint >= 0x00C6 && codePoint <= 0x00D7) || (codePoint >= 0x00D8 && codePoint <= 0x00E1) ||
        (codePoint >= 0x00E6 && codePoint <= 0x00EF) || (codePoint >= 0x00F0 && codePoint <= 0x00F7) ||
        (codePoint >= 0x00F8 && codePoint <= 0x00FB) || (codePoint >= 0x00FC && codePoint <= 0x00FD) ||
        codePoint === 0x00FE || codePoint === 0x00FF) return 'A';
    
    return 'N';
};

const characterLength = (char) => (['F', 'W', 'A'].includes(eastAsianWidth(char))) ? 2 : 1;

const length = (string) => Array.from(string).reduce((sum, char) => sum + characterLength(char), 0);

module.exports = { eastAsianWidth, characterLength, length };
