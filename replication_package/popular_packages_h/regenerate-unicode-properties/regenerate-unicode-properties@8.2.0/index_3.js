const unicodeProperties = new Map();

unicodeProperties.set('General_Category', [
	'Cased_Letter', 'Close_Punctuation', 'Connector_Punctuation', 'Control',
	'Currency_Symbol', 'Dash_Punctuation', 'Decimal_Number', 'Enclosing_Mark',
	'Final_Punctuation', 'Format', 'Initial_Punctuation', 'Letter',
	'Letter_Number', 'Line_Separator', 'Lowercase_Letter', 'Mark',
	'Math_Symbol', 'Modifier_Letter', 'Modifier_Symbol', 'Nonspacing_Mark',
	'Number', 'Open_Punctuation', 'Other', 'Other_Letter', 'Other_Number',
	'Other_Punctuation', 'Other_Symbol', 'Paragraph_Separator', 'Private_Use',
	'Punctuation', 'Separator', 'Space_Separator', 'Spacing_Mark', 'Surrogate',
	'Symbol', 'Titlecase_Letter', 'Unassigned', 'Uppercase_Letter'
]);

unicodeProperties.set('Script', [
	'Adlam', 'Ahom', 'Anatolian_Hieroglyphs', 'Arabic', 'Armenian', 'Avestan',
	'Balinese', 'Bamum', 'Bassa_Vah', 'Batak', 'Bengali', 'Bhaiksuki', 'Bopomofo',
	'Brahmi', 'Braille', 'Buginese', 'Buhid', 'Canadian_Aboriginal', 'Carian',
	'Caucasian_Albanian', 'Chakma', 'Cham', 'Cherokee', 'Chorasmian', 'Common',
	'Coptic', 'Cuneiform', 'Cypriot', 'Cyrillic', 'Deseret', 'Devanagari',
	'Dives_Akuru', 'Dogra', 'Duployan', 'Egyptian_Hieroglyphs', 'Elbasan',
	'Elymaic', 'Ethiopic', 'Georgian', 'Glagolitic', 'Gothic', 'Grantha', 'Greek',
	'Gujarati', 'Gunjala_Gondi', 'Gurmukhi', 'Han', 'Hangul', 'Hanifi_Rohingya',
	'Hanunoo', 'Hatran', 'Hebrew', 'Hiragana', 'Imperial_Aramaic', 'Inherited',
	'Inscriptional_Pahlavi', 'Inscriptional_Parthian', 'Javanese', 'Kaithi',
	'Kannada', 'Katakana', 'Kayah_Li', 'Kharoshthi', 'Khitan_Small_Script',
	'Khmer', 'Khojki', 'Khudawadi', 'Lao', 'Latin', 'Lepcha', 'Limbu', 'Linear_A',
	'Linear_B', 'Lisu', 'Lycian', 'Lydian', 'Mahajani', 'Makasar', 'Malayalam',
	'Mandaic', 'Manichaean', 'Marchen', 'Masaram_Gondi', 'Medefaidrin',
	'Meetei_Mayek', 'Mende_Kikakui', 'Meroitic_Cursive', 'Meroitic_Hieroglyphs',
	'Miao', 'Modi', 'Mongolian', 'Mro', 'Multani', 'Myanmar', 'Nabataean',
	'Nandinagari', 'New_Tai_Lue', 'Newa', 'Nko', 'Nushu', 'Nyiakeng_Puachue_Hmong',
	'Ogham', 'Ol_Chiki', 'Old_Hungarian', 'Old_Italic', 'Old_North_Arabian',
	'Old_Permic', 'Old_Persian', 'Old_Sogdian', 'Old_South_Arabian', 'Old_Turkic',
	'Oriya', 'Osage', 'Osmanya', 'Pahawh_Hmong', 'Palmyrene', 'Pau_Cin_Hau',
	'Phags_Pa', 'Phoenician', 'Psalter_Pahlavi', 'Rejang', 'Runic', 'Samaritan',
	'Saurashtra', 'Sharada', 'Shavian', 'Siddham', 'SignWriting', 'Sinhala',
	'Sogdian', 'Sora_Sompeng', 'Soyombo', 'Sundanese', 'Syloti_Nagri', 'Syriac',
	'Tagalog', 'Tagbanwa', 'Tai_Le', 'Tai_Tham', 'Tai_Viet', 'Takri', 'Tamil',
	'Tangut', 'Telugu', 'Thaana', 'Thai', 'Tibetan', 'Tifinagh', 'Tirhuta',
	'Ugaritic', 'Vai', 'Wancho', 'Warang_Citi', 'Yezidi', 'Yi', 'Zanabazar_Square'
]);

unicodeProperties.set('Script_Extensions', [
	'Adlam', 'Ahom', 'Anatolian_Hieroglyphs', 'Arabic', 'Armenian', 'Avestan',
	'Balinese', 'Bamum', 'Bassa_Vah', 'Batak', 'Bengali', 'Bhaiksuki', 'Bopomofo',
	'Brahmi', 'Braille', 'Buginese', 'Buhid', 'Canadian_Aboriginal', 'Carian',
	'Caucasian_Albanian', 'Chakma', 'Cham', 'Cherokee', 'Chorasmian', 'Common',
	'Coptic', 'Cuneiform', 'Cypriot', 'Cyrillic', 'Deseret', 'Devanagari',
	'Dives_Akuru', 'Dogra', 'Duployan', 'Egyptian_Hieroglyphs', 'Elbasan',
	'Elymaic', 'Ethiopic', 'Georgian', 'Glagolitic', 'Gothic', 'Grantha', 'Greek',
	'Gujarati', 'Gunjala_Gondi', 'Gurmukhi', 'Han', 'Hangul', 'Hanifi_Rohingya',
	'Hanunoo', 'Hatran', 'Hebrew', 'Hiragana', 'Imperial_Aramaic', 'Inherited',
	'Inscriptional_Pahlavi', 'Inscriptional_Parthian', 'Javanese', 'Kaithi',
	'Kannada', 'Katakana', 'Kayah_Li', 'Kharoshthi', 'Khitan_Small_Script',
	'Khmer', 'Khojki', 'Khudawadi', 'Lao', 'Latin', 'Lepcha', 'Limbu', 'Linear_A',
	'Linear_B', 'Lisu', 'Lycian', 'Lydian', 'Mahajani', 'Makasar', 'Malayalam',
	'Mandaic', 'Manichaean', 'Marchen', 'Masaram_Gondi', 'Medefaidrin',
	'Meetei_Mayek', 'Mende_Kikakui', 'Meroitic_Cursive', 'Meroitic_Hieroglyphs',
	'Miao', 'Modi', 'Mongolian', 'Mro', 'Multani', 'Myanmar', 'Nabataean',
	'Nandinagari', 'New_Tai_Lue', 'Newa', 'Nko', 'Nushu', 'Nyiakeng_Puachue_Hmong',
	'Ogham', 'Ol_Chiki', 'Old_Hungarian', 'Old_Italic', 'Old_North_Arabian',
	'Old_Permic', 'Old_Persian', 'Old_Sogdian', 'Old_South_Arabian', 'Old_Turkic',
	'Oriya', 'Osage', 'Osmanya', 'Pahawh_Hmong', 'Palmyrene', 'Pau_Cin_Hau',
	'Phags_Pa', 'Phoenician', 'Psalter_Pahlavi', 'Rejang', 'Runic', 'Samaritan',
	'Saurashtra', 'Sharada', 'Shavian', 'Siddham', 'SignWriting', 'Sinhala',
	'Sogdian', 'Sora_Sompeng', 'Soyombo', 'Sundanese', 'Syloti_Nagri', 'Syriac',
	'Tagalog', 'Tagbanwa', 'Tai_Le', 'Tai_Tham', 'Tai_Viet', 'Takri', 'Tamil',
	'Tangut', 'Telugu', 'Thaana', 'Thai', 'Tibetan', 'Tifinagh', 'Tirhuta',
	'Ugaritic', 'Vai', 'Wancho', 'Warang_Citi', 'Yezidi', 'Yi', 'Zanabazar_Square'
]);

unicodeProperties.set('Binary_Property', [
	'ASCII', 'ASCII_Hex_Digit', 'Alphabetic', 'Any', 'Assigned', 'Bidi_Control',
	'Bidi_Mirrored', 'Case_Ignorable', 'Cased', 'Changes_When_Casefolded',
	'Changes_When_Casemapped', 'Changes_When_Lowercased', 'Changes_When_NFKC_Casefolded',
	'Changes_When_Titlecased', 'Changes_When_Uppercased', 'Dash', 'Default_Ignorable_Code_Point',
	'Deprecated', 'Diacritic', 'Emoji', 'Emoji_Component', 'Emoji_Modifier',
	'Emoji_Modifier_Base', 'Emoji_Presentation', 'Extended_Pictographic', 'Extender',
	'Grapheme_Base', 'Grapheme_Extend', 'Hex_Digit', 'IDS_Binary_Operator',
	'IDS_Trinary_Operator', 'ID_Continue', 'ID_Start', 'Ideographic', 'Join_Control',
	'Logical_Order_Exception', 'Lowercase', 'Math', 'Noncharacter_Code_Point',
	'Pattern_Syntax', 'Pattern_White_Space', 'Quotation_Mark', 'Radical',
	'Regional_Indicator', 'Sentence_Terminal', 'Soft_Dotted', 'Terminal_Punctuation',
	'Unified_Ideograph', 'Uppercase', 'Variation_Selector', 'White_Space',
	'XID_Continue', 'XID_Start'
]);

module.exports = unicodeProperties;
