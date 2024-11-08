"use strict";

// Export functions to handle identifier operations
export { isIdentifierName, isIdentifierChar, isIdentifierStart } from "./identifier";

// Export functions to handle keyword operations
export { 
  isReservedWord, 
  isStrictBindOnlyReservedWord, 
  isStrictBindReservedWord, 
  isStrictReservedWord, 
  isKeyword 
} from "./keyword";
