"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = annotateAsPure;

// Import Babel types
var t = _interopRequireWildcard(require("@babel/types"));

// A helper function to handle module imports
function _getRequireWildcardCache() { 
  if (typeof WeakMap !== "function") return null; 
  var cache = new WeakMap(); 
  _getRequireWildcardCache = function () { return cache; }; 
  return cache; 
}

function _interopRequireWildcard(obj) { 
  if (obj && obj.__esModule) { 
    return obj; 
  } 
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") { 
    return { default: obj }; 
  } 
  var cache = _getRequireWildcardCache(); 
  if (cache && cache.has(obj)) { 
    return cache.get(obj); 
  } 
  var newObj = {}; 
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; 
  for (var key in obj) { 
    if (Object.prototype.hasOwnProperty.call(obj, key)) { 
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; 
      if (desc && (desc.get || desc.set)) { 
        Object.defineProperty(newObj, key, desc); 
      } else { 
        newObj[key] = obj[key]; 
      } 
    } 
  } 
  newObj.default = obj; 
  if (cache) { cache.set(obj, newObj); } 
  return newObj; 
}

// Constant for the PURE annotation
const PURE_ANNOTATION = "#__PURE__";

// A utility function to determine if a node is already annotated as pure
const isPureAnnotated = ({ leadingComments }) => 
  !!leadingComments && leadingComments.some(
    comment => /[@#]__PURE__/.test(comment.value)
  );

// The main function to annotate nodes with PURE comments
function annotateAsPure(pathOrNode) {
  const node = pathOrNode["node"] || pathOrNode; // Extract node from path if necessary

  if (isPureAnnotated(node)) { // Check if already annotated
    return; // Exit if already pure
  }

  // Use Babel's utility to add a comment
  t.addComment(node, "leading", PURE_ANNOTATION);
}
