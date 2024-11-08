// index.js
const eastAsianWidth = (char) => {
    const codePoint = char.codePointAt(0);

    const ranges = [
        { type: 'F', ranges: [[0xFF01, 0xFF60], [0xFFE0, 0xFFE6]] },
        { type: 'H', ranges: [[0xFF61, 0xFFBE], [0xFFE8, 0xFFEE]] },
        { type: 'W', ranges: [
            [0x1100, 0x115F], [0x2329, 0x232A], [0x2E80, 0x303E],
            [0x3040, 0xA4CF], [0xAC00, 0xD7A3], [0xF900, 0xFAFF],
            [0xFE10, 0xFE19], [0xFE30, 0xFE6F], [0xFF00, 0xFF60],
            [0xFFE0, 0xFFE6], [0x1F300, 0x1F64F], [0x1F900, 0x1F9FF],
            [0x20000, 0x2FFFD], [0x30000, 0x3FFFD]] },
        { type: 'Na', ranges: [
            [0x20, 0x7E], [0xA2, 0xA3], [0xA5, 0xA6],
            [0x2030, 0x2030], [0x2032, 0x2033], [0x2103, 0x2103],
            [0x2109, 0x2109], [0x2113, 0x2113], [0x2116, 0x2116],
            [0x2121, 0x2122], [0x2126, 0x2126]] },
        { type: 'A', ranges: [
            [0x00A1, 0x00A3], [0x00A5, 0x00A6], [0x00A7, 0x00A7],
            [0x00A9, 0x00AB], [0x00AC, 0x00AE], [0x00B0, 0x00B4],
            [0x00B6, 0x00B7], [0x00B8, 0x00BB], [0x00BC, 0x00BE],
            [0x00C6, 0x00D7], [0x00D8, 0x00E1], [0x00E6, 0x00EF],
            [0x00F0, 0x00F7], [0x00F8, 0x00FB], [0x00FC, 0x00FD],
            [0x00FE, 0x00FF]] }
    ];

    for (let rangeGroup of ranges) {
        for (let [start, end] of rangeGroup.ranges) {
            if (codePoint >= start && codePoint <= end) {
                return rangeGroup.type;
            }
        }
    }

    return 'N';
};

const characterLength = (char) => {
    const widthType = eastAsianWidth(char);
    return (widthType === 'F' || widthType === 'W' || widthType === 'A') ? 2 : 1;
};

const length = (string) => {
    return Array.from(string).reduce((sum, char) => sum + characterLength(char), 0);
};

module.exports = { eastAsianWidth, characterLength, length };
