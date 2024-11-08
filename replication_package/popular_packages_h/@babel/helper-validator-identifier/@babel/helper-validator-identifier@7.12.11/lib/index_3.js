"use strict";

import { 
  isIdentifierName,
  isIdentifierChar,
  isIdentifierStart
} from "./identifier";

import { 
  isReservedWord, 
  isStrictBindOnlyReservedWord, 
  isStrictBindReservedWord, 
  isStrictReservedWord, 
  isKeyword 
} from "./keyword";

export {
  isIdentifierName,
  isIdentifierChar,
  isIdentifierStart,
  isReservedWord,
  isStrictBindOnlyReservedWord,
  isStrictBindReservedWord,
  isStrictReservedWord,
  isKeyword
};
