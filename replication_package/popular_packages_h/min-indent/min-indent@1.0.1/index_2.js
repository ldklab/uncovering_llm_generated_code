'use strict';

module.exports = function findMinimumLeadingWhitespace(string) {
	const leadingWhitespaceMatches = string.match(/^[ \t]*(?=\S)/gm);

	if (!leadingWhitespaceMatches) {
		return 0;
	}

	return leadingWhitespaceMatches.reduce((minimumLength, currentWhitespace) => {
		return Math.min(minimumLength, currentWhitespace.length);
	}, Infinity);
};
