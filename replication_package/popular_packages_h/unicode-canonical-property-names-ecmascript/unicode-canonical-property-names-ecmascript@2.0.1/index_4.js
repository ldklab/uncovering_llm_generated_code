// This module exports a set of Unicode property names used for text processing.
module.exports = new Set([
  // List of non-binary Unicode properties
  'General_Category',    // General category of the character (e.g., uppercase letter, digit)
  'Script',              // The script to which the character belongs (e.g., Latin, Cyrillic)
  'Script_Extensions',   // Additional scripts a character may belong to

  // List of binary Unicode properties
  'Alphabetic',          // If the character is alphabetic
  'Any',                 // Matches any character
  'ASCII',               // If the character is part of the ASCII set
  'ASCII_Hex_Digit',     // If the character is a valid hexadecimal digit in the ASCII range
  'Assigned',            // If the character has been assigned in Unicode
  'Bidi_Control',        // Bidirectional control characters
  'Bidi_Mirrored',       // Characters with a bidirectional mirror equivalent
  'Case_Ignorable',      // Characters that do not affect casing
  'Cased',               // If the character is a cased letter
  'Changes_When_Casefolded', // Characters that change when casefolded
  'Changes_When_Casemapped', // Characters that change when case-mapped
  'Changes_When_Lowercased', // Characters that change when converted to lowercase
  'Changes_When_NFKC_Casefolded', // Characters that change when NFKC casefolded
  'Changes_When_Titlecased', // Characters that change when title-cased
  'Changes_When_Uppercased', // Characters that change when converted to uppercase
  'Dash',               // Dash or hyphen characters
  'Default_Ignorable_Code_Point', // Characters typically not visible
  'Deprecated',         // Deprecated characters
  'Diacritic',          // Diacritical marks
  'Emoji',              // Emoji characters
  'Emoji_Component',    // Parts of emoji sequences
  'Emoji_Modifier',     // Emoji modifier (skin tone, etc.)
  'Emoji_Modifier_Base', // Base characters for an emoji modifier
  'Emoji_Presentation', // Characters with emoji representation
  'Extended_Pictographic', // Extended collection of emoji-like characters
  'Extender',           // Characters used to extend letter shapes
  'Grapheme_Base',      // Base component of a grapheme cluster
  'Grapheme_Extend',    // Extension part of a grapheme cluster
  'Hex_Digit',          // Hexadecimal digits
  'ID_Continue',        // Characters suitable for continuing an identifier
  'ID_Start',           // Characters suitable for starting an identifier
  'Ideographic',        // Ideographic characters like Han
  'IDS_Binary_Operator', // Ideographic description sequence binary operator
  'IDS_Trinary_Operator', // Ideographic description sequence trinary operator
  'Join_Control',       // Join control characters
  'Logical_Order_Exception', // Characters needing logical order exceptions
  'Lowercase',          // Lowercase characters
  'Math',               // Mathematical characters
  'Noncharacter_Code_Point', // Non-characters in Unicode
  'Pattern_Syntax',     // Characters used in pattern syntax
  'Pattern_White_Space', // Whitespace used in pattern syntax
  'Quotation_Mark',     // Characters used as quotation marks
  'Radical',            // Radicals in logograms like Han
  'Regional_Indicator', // Regional indicator characters
  'Sentence_Terminal',  // Sentence terminal punctuation
  'Soft_Dotted',        // Soft dotted characters
  'Terminal_Punctuation', // Terminal punctuation marks
  'Unified_Ideograph',  // Unified ideographs
  'Uppercase',          // Uppercase characters
  'Variation_Selector', // Variation selectors for characters
  'White_Space',        // White space characters
  'XID_Continue',      // Identifier-continue characters for extended identifiers
  'XID_Start'          // Identifier-start characters for extended identifiers
]);
