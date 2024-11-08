'use strict';

module.exports = function findMinIndentation(string) {
	// Find matches of leading spaces or tabs in each line with at least one non-space character
	const matches = string.match(/^[ \t]*(?=\S)/gm);

	// If there are no non-empty lines, return 0
	if (!matches) {
		return 0;
	}

	// Reduce the matches to find the minimum length of leading whitespace
	return matches.reduce((currentMin, match) => {
		return Math.min(currentMin, match.length);
	}, Infinity);
};
