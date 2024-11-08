'use strict';
module.exports = function calculateMinIndentation(inputString) {
	const leadingSpaceMatches = inputString.match(/^[ \t]*(?=\S)/gm);
	
	if (!leadingSpaceMatches) {
		return 0;
	}

	return leadingSpaceMatches.reduce((minIndent, currentMatch) => {
		return Math.min(minIndent, currentMatch.length);
	}, Infinity);
};
