// unicode-canonical-property-names-ecmascript/index.js

// Define a set of canonical Unicode property names relevant to ECMAScript
const canonicalPropertyNames = new Set([
  'General_Category',
  'Script',
  'Script_Extensions',
  'Block',
  'AM_PM',
  'Alphabetic',
  'Any',
  'Assigned',
  'Bidi_Control',
  'Bidi_Mirrored',
  'Case_Ignorable',
  'Cased',
  'Changes_When_Casefolded',
  'Changes_When_Casemapped',
  'Changes_When_Lowercased',
  'Changes_When_NFKC_Casefolded',
  'Changes_When_Titlecased',
  'Changes_When_Uppercased',
  'Dash',
  'Default_Ignorable_Code_Point',
  'Deprecated',
  'Diacritic',
  'Emoji',
  'Emoji_Component',
  'Emoji_Modifier',
  'Emoji_Modifier_Base',
  'Emoji_Presentation',
  'Extended_Pictographic',
  'Extender',
  'Grapheme_Base',
  'Grapheme_Extend',
  'Hex_Digit',
  'ID_Continue',
  'ID_Start',
  'Ideographic',
  'IDS_Binary_Operator',
  'IDS_Trinary_Operator',
  'Join_Control',
  'Logical_Order_Exception',
  'Lowercase',
  'Math',
  'Noncharacter_Code_Point',
  'Pattern_Syntax',
  'Pattern_White_Space',
  'Quotation_Mark',
  'Radical',
  'Regional_Indicator',
  'Sentence_Terminal',
  'Soft_Dotted',
  'Terminal_Punctuation',
  'Unified_Ideograph',
  'Uppercase',
  'Variation_Selector',
  'White_Space',
  'XID_Continue',
  'XID_Start'
]);

// Export an object with a method to check if a property name is canonical
module.exports = {
  has(propertyName) {
    return canonicalPropertyNames.has(propertyName);
  }
};

// Example of package.json (partial)
{
  "name": "unicode-canonical-property-names-ecmascript",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT"
}
