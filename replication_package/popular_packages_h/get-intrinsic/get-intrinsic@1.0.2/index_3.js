'use strict';

const undefined = void 0;
const $SyntaxError = SyntaxError;
const $Function = Function;
const $TypeError = TypeError;

const getEvalledConstructor = (expressionSyntax) => {
  try {
    return Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
  } catch (e) {}
};

let $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
  try {
    $gOPD({}, '');
  } catch (e) {
    $gOPD = null;
  }
}

const throwTypeError = () => { throw new $TypeError(); };
const ThrowTypeError = $gOPD ? (() => {
  try {
    arguments.callee; 
    return throwTypeError;
  } catch (calleeThrows) {
    try {
      return $gOPD(arguments, 'callee').get;
    } catch (gOPDthrows) {
      return throwTypeError;
    }
  }
})() : throwTypeError;

const hasSymbols = require('has-symbols')();
const getProto = Object.getPrototypeOf || ((x) => x.__proto__);

const asyncGenFunction = getEvalledConstructor('async function* () {}');
const asyncGenFunctionPrototype = asyncGenFunction ? asyncGenFunction.prototype : undefined;
const asyncGenPrototype = asyncGenFunctionPrototype ? asyncGenFunctionPrototype.prototype : undefined;

const TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

const INTRINSICS = {
  '%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
  '%Array%': Array,
  // ...(other built-in types),
  '%TypedArray%': TypedArray,
  '%ThrowTypeError%': ThrowTypeError
};

const LEGACY_ALIASES = {
  '%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
  // ...(other legacy aliases),
  '%WeakSetPrototype%': ['WeakSet', 'prototype']
};

const bind = require('function-bind');
const hasOwn = require('has');
const $concat = bind.call(Function.call, Array.prototype.concat);
const $spliceApply = bind.call(Function.apply, Array.prototype.splice);
const $replace = bind.call(Function.call, String.prototype.replace);
const $strSlice = bind.call(Function.call, String.prototype.slice);

const rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
const reEscapeChar = /\\(\\)?/g;
const stringToPath = (string) => {
  const first = $strSlice(string, 0, 1);
  const last = $strSlice(string, -1);
  if (first === '%' && last !== '%') throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
  else if (last === '%' && first !== '%') throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');

  const result = [];
  $replace(string, rePropName, (match, number, quote, subString) => {
    result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
  });
  return result;
};

const getBaseIntrinsic = (name, allowMissing) => {
  let intrinsicName = name;
  let alias;
  if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
    alias = LEGACY_ALIASES[intrinsicName];
    intrinsicName = '%' + alias[0] + '%';
  }

  if (hasOwn(INTRINSICS, intrinsicName)) {
    const value = INTRINSICS[intrinsicName];
    if (typeof value === 'undefined' && !allowMissing) {
      throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
    }

    return { alias, name: intrinsicName, value };
  }

  throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new $TypeError('intrinsic name must be a non-empty string');
  }
  if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
    throw new $TypeError('"allowMissing" argument must be a boolean');
  }

  const parts = stringToPath(name);
  let intrinsicBaseName = parts.length > 0 ? parts[0] : '';
  let intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
  let intrinsicRealName = intrinsic.name;
  let value = intrinsic.value;
  let skipFurtherCaching = false;
  const alias = intrinsic.alias;

  if (alias) {
    intrinsicBaseName = alias[0];
    $spliceApply(parts, $concat([0, 1], alias));
  }

  for (let i = 1, isOwn = true; i < parts.length; i += 1) {
    const part = parts[i];
    const first = $strSlice(part, 0, 1);
    const last = $strSlice(part, -1);

    if (
      ((first === '"' || first === "'" || first === '`') ||
      (last === '"' || last === "'" || last === '`')) &&
      first !== last
    ) {
      throw new $SyntaxError('property names with quotes must have matching quotes');
    }
    if (part === 'constructor' || !isOwn) {
      skipFurtherCaching = true;
    }

    intrinsicBaseName += '.' + part;
    intrinsicRealName = '%' + intrinsicBaseName + '%';

    if (hasOwn(INTRINSICS, intrinsicRealName)) {
      value = INTRINSICS[intrinsicRealName];
    } else if (value != null) {
      if (!(part in value)) {
        if (!allowMissing) {
          throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
        }
        return void undefined;
      }
      if ($gOPD && (i + 1) >= parts.length) {
        const desc = $gOPD(value, part);
        isOwn = !!desc;

        if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
          value = desc.get;
        } else {
          value = value[part];
        }
      } else {
        isOwn = hasOwn(value, part);
        value = value[part];
      }

      if (isOwn && !skipFurtherCaching) {
        INTRINSICS[intrinsicRealName] = value;
      }
    }
  }
  return value;
};
