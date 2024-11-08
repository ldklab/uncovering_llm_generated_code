"use strict";

module.exports = () => {
  // Unicode ranges for various character types
  const astralRange = "\\ud800-\\udfff"; // Astral plane characters
  const comboMarksRange = "\\u0300-\\u036f"; // Combining marks
  const comboHalfMarksRange = "\\ufe20-\\ufe2f"; // Combining half marks
  const comboSymbolsRange = "\\u20d0-\\u20ff"; // Combining symbols
  const comboMarksExtendedRange = "\\u1ab0-\\u1aff"; // Extended combining marks
  const comboMarksSupplementRange = "\\u1dc0-\\u1dff"; // Supplementary combining marks
  const comboRange = `${comboMarksRange}${comboHalfMarksRange}${comboSymbolsRange}${comboMarksExtendedRange}${comboMarksSupplementRange}`;
  const varRange = "\\ufe0e\\ufe0f"; // Text and emoji variation selectors
  const familyRange = "\\uD83D\\uDC69\\uD83C\\uDFFB\\u200D\\uD83C\\uDF93"; // Family emoji range

  // Unicode capture groups
  const astral = `[${astralRange}]`; // Capture astral characters
  const combo = `[${comboRange}]`; // Capture combining characters
  const fitz = "\\ud83c[\\udffb-\\udfff]"; // Fitzpatrick skin tone modifiers
  const modifier = `(?:${combo}|${fitz})`; // Modifiers (optional)
  const nonAstral = `[^${astralRange}]`; // Non-astral characters
  const regional = "(?:\\uD83C[\\uDDE6-\\uDDFF]){2}"; // Regional indicator pairs
  const surrogatePair = "[\\ud800-\\udbff][\\udc00-\\udfff]"; // Surrogate pairs
  const zwj = "\\u200d"; // Zero-width joiner
  const blackFlag = "(?:\\ud83c\\udff4\\udb40\\udc67\\udb40\\udc62\\udb40(?:\\udc65|\\udc73|\\udc77)\\udb40(?:\\udc6e|\\udc63|\\udc6c)\\udb40(?:\\udc67|\\udc74|\\udc73)\\udb40\\udc7f)"; // Black flag emoji
  const family = `[${familyRange}]`; // Group family emojis

  // Composing regex parts
  const optModifier = `${modifier}?`; // Optional modifiers
  const optVar = `[${varRange}]?`; // Optional variation selectors
  const optJoin = `(?:${zwj}(?:${[nonAstral, regional, surrogatePair].join("|")})${optVar}${optModifier})*`; // Optional join sequence
  const seq = `${optVar}${optModifier}${optJoin}`; // Full sequence
  const nonAstralCombo = `${nonAstral}${combo}?`; // Non-astral with optional combining marks
  const symbol = `(?:${[nonAstralCombo, combo, regional, surrogatePair, astral, family].join("|")})`; // Symbol match

  // Return regex to match complex Unicode symbols
  return new RegExp(`${blackFlag}|${fitz}(?=${fitz})|${symbol}${seq}`, "g");
}
