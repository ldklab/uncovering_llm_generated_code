'use strict';

module.exports = function calculateMinimumIndent(inputString) {
	const indentationMatches = inputString.match(/^[ \t]*(?=\S)/gm);

	if (!indentationMatches) {
		return 0;
	}

	const minimumIndentation = indentationMatches.reduce((currentMin, lineIndent) => {
		return Math.min(currentMin, lineIndent.length);
	}, Infinity);

	return minimumIndentation;
};
