"use strict"

module.exports = () => {
    // Define ranges for Unicode characters
    const astralRange = "\\ud800-\\udfff";
    const comboMarksRange = "\\u0300-\\u036f";
    const comboHalfMarksRange = "\\ufe20-\\ufe2f";
    const comboSymbolsRange = "\\u20d0-\\u20ff";
    const comboMarksExtendedRange = "\\u1ab0-\\u1aff";
    const comboMarksSupplementRange = "\\u1dc0-\\u1dff";
    const comboRange = [
        comboMarksRange,
        comboHalfMarksRange,
        comboSymbolsRange,
        comboMarksExtendedRange,
        comboMarksSupplementRange
    ].join('');
    const varRange = "\\ufe0e\\ufe0f";
    const familyRange = "\\uD83D\\uDC69\\uD83C\\uDFFB\\u200D\\uD83C\\uDF93";

    // Define patterns for various Unicode elements
    const astral = `[${astralRange}]`;
    const combo = `[${comboRange}]`;
    const fitz = "\\ud83c[\\udffb-\\udfff]";
    const modifier = `(?:${combo}|${fitz})`;
    const nonAstral = `[^${astralRange}]`;
    const regional = "(?:\\uD83C[\\uDDE6-\\uDDFF]){2}";
    const surrogatePair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    const zwj = "\\u200d";
    const blackFlag = "(?:\\ud83c\\udff4\\udb40\\udc67\\udb40\\udc62\\udb40(?:\\udc65|\\udc73|\\udc77)\\udb40(?:\\udc6e|\\udc63|\\udc6c)\\udb40(?:\\udc67|\\udc74|\\udc73)\\udb40\\udc7f)";
    const family = `[${familyRange}]`;

    // Construct the full regex components
    const optModifier = `${modifier}?`;
    const optVar = `[${varRange}]?`;
    const optJoin = `(?:${zwj}(?:${[nonAstral, regional, surrogatePair].join("|")})${optVar + optModifier})*`;
    const seq = optVar + optModifier + optJoin;
    const nonAstralCombo = `${nonAstral}${combo}?`;
    const symbol = `(?:${[nonAstralCombo, combo, regional, surrogatePair, astral, family].join("|")})`;

    // Return the full regular expression
    return new RegExp(`${blackFlag}|${fitz}(?=${fitz})|${symbol + seq}`, "g");
}
