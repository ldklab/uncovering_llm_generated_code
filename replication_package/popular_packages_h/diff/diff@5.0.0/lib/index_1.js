"use strict";

import _base from './diff/base';
import { diffChars } from './diff/character';
import { diffWords, diffWordsWithSpace } from './diff/word';
import { diffLines, diffTrimmedLines } from './diff/line';
import { diffSentences } from './diff/sentence';
import { diffCss } from './diff/css';
import { diffJson, canonicalize } from './diff/json';
import { diffArrays } from './diff/array';
import { applyPatch, applyPatches } from './patch/apply';
import { parsePatch } from './patch/parse';
import { merge } from './patch/merge';
import { structuredPatch, createTwoFilesPatch, createPatch } from './patch/create';
import { convertChangesToDMP } from './convert/dmp';
import { convertChangesToXML } from './convert/xml';

export {
  _base as Diff,
  diffChars,
  diffWords,
  diffWordsWithSpace,
  diffLines,
  diffTrimmedLines,
  diffSentences,
  diffCss,
  diffJson,
  canonicalize,
  diffArrays,
  applyPatch,
  applyPatches,
  parsePatch,
  merge,
  structuredPatch,
  createTwoFilesPatch,
  createPatch,
  convertChangesToDMP,
  convertChangesToXML
};
