const unicodePropertyMap = new Map([
  ['scx', 'Script_Extensions'],
  ['sc', 'Script'],
  ['gc', 'General_Category'],
  ['AHex', 'ASCII_Hex_Digit'],
  ['Alpha', 'Alphabetic'],
  ['Bidi_C', 'Bidi_Control'],
  ['Bidi_M', 'Bidi_Mirrored'],
  ['Cased', 'Cased'],
  ['CI', 'Case_Ignorable'],
  ['CWCF', 'Changes_When_Casefolded'],
  ['CWCM', 'Changes_When_Casemapped'],
  ['CWKCF', 'Changes_When_NFKC_Casefolded'],
  ['CWL', 'Changes_When_Lowercased'],
  ['CWT', 'Changes_When_Titlecased'],
  ['CWU', 'Changes_When_Uppercased'],
  ['Dash', 'Dash'],
  ['Dep', 'Deprecated'],
  ['DI', 'Default_Ignorable_Code_Point'],
  ['Dia', 'Diacritic'],
  ['EBase', 'Emoji_Modifier_Base'],
  ['EComp', 'Emoji_Component'],
  ['EMod', 'Emoji_Modifier'],
  ['Emoji', 'Emoji'],
  ['EPres', 'Emoji_Presentation'],
  ['Ext', 'Extender'],
  ['ExtPict', 'Extended_Pictographic'],
  ['Gr_Base', 'Grapheme_Base'],
  ['Gr_Ext', 'Grapheme_Extend'],
  ['Hex', 'Hex_Digit'],
  ['IDC', 'ID_Continue'],
  ['Ideo', 'Ideographic'],
  ['IDS', 'ID_Start'],
  ['IDSB', 'IDS_Binary_Operator'],
  ['IDST', 'IDS_Trinary_Operator'],
  ['Join_C', 'Join_Control'],
  ['LOE', 'Logical_Order_Exception'],
  ['Lower', 'Lowercase'],
  ['Math', 'Math'],
  ['NChar', 'Noncharacter_Code_Point'],
  ['Pat_Syn', 'Pattern_Syntax'],
  ['Pat_WS', 'Pattern_White_Space'],
  ['QMark', 'Quotation_Mark'],
  ['Radical', 'Radical'],
  ['RI', 'Regional_Indicator'],
  ['SD', 'Soft_Dotted'],
  ['STerm', 'Sentence_Terminal'],
  ['Term', 'Terminal_Punctuation'],
  ['UIdeo', 'Unified_Ideograph'],
  ['Upper', 'Uppercase'],
  ['VS', 'Variation_Selector'],
  ['WSpace', 'White_Space'],
  ['space', 'White_Space'],
  ['XIDC', 'XID_Continue'],
  ['XIDS', 'XID_Start']
]);

module.exports = unicodePropertyMap;
