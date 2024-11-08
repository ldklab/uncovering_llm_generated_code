"use strict";

import { 
  isIdentifierChar as _isIdentifierChar, 
  isIdentifierName as _isIdentifierName, 
  isIdentifierStart as _isIdentifierStart 
} from './identifier.js';

import {
  isKeyword as _isKeyword,
  isReservedWord as _isReservedWord,
  isStrictBindOnlyReservedWord as _isStrictBindOnlyReservedWord,
  isStrictBindReservedWord as _isStrictBindReservedWord,
  isStrictReservedWord as _isStrictReservedWord
} from './keyword.js';

export const isIdentifierChar = _isIdentifierChar;
export const isIdentifierName = _isIdentifierName;
export const isIdentifierStart = _isIdentifierStart;
export const isKeyword = _isKeyword;
export const isReservedWord = _isReservedWord;
export const isStrictBindOnlyReservedWord = _isStrictBindOnlyReservedWord;
export const isStrictBindReservedWord = _isStrictBindReservedWord;
export const isStrictReservedWord = _isStrictReservedWord;

//# sourceMappingURL=index.js.map
