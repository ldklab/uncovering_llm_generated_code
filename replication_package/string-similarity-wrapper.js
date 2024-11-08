if (process.argv.length < 4)
{
	console.error("Expected Two Arguments");
	process.exit(1);
}

var stringSimilarity = require("string-similarity");

let item1 = process.argv[2];
let item2 = process.argv[3];

let similarity = stringSimilarity.compareTwoStrings(item1, item2);

console.log("String Similarity Score: " + similarity)