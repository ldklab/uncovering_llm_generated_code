const modules = [
  "F", "T", "__", "add", "addIndex", "addIndexRight", "adjust", "all", "allPass", "always", "and", "any", "anyPass", "ap",
  "aperture", "append", "apply", "applySpec", "applyTo", "ascend", "ascendNatural", "assoc", "assocPath", "binary", "bind",
  "both", "call", "chain", "clamp", "clone", "collectBy", "comparator", "complement", "compose", "composeWith", "concat",
  "cond", "construct", "constructN", "converge", "count", "countBy", "curry", "curryN", "dec", "defaultTo", "descend",
  "descendNatural", "difference", "differenceWith", "dissoc", "dissocPath", "divide", "drop", "dropLast", "dropLastWhile",
  "dropRepeats", "dropRepeatsBy", "dropRepeatsWith", "dropWhile", "either", "empty", "endsWith", "eqBy", "eqProps", "equals",
  "evolve", "filter", "find", "findIndex", "findLast", "findLastIndex", "flatten", "flip", "flow", "forEach", "forEachObjIndexed",
  "fromPairs", "groupBy", "groupWith", "gt", "gte", "has", "hasIn", "hasPath", "head", "identical", "identity", "ifElse",
  "inc", "includes", "indexBy", "indexOf", "init", "innerJoin", "insert", "insertAll", "intersection", "intersperse", "into",
  "invert", "invertObj", "invoker", "is", "isEmpty", "isNil", "isNotEmpty", "isNotNil", "join", "juxt", "keys", "keysIn",
  "last", "lastIndexOf", "length", "lens", "lensIndex", "lensPath", "lensProp", "lift", "liftN", "lt", "lte", "map",
  "mapAccum", "mapAccumRight", "mapObjIndexed", "match", "mathMod", "max", "maxBy", "mean", "median", "memoizeWith",
  "mergeAll", "mergeDeepLeft", "mergeDeepRight", "mergeDeepWith", "mergeDeepWithKey", "mergeLeft", "mergeRight", "mergeWith",
  "mergeWithKey", "min", "minBy", "modify", "modifyPath", "modulo", "move", "multiply", "nAry", "partialObject", "negate",
  "none", "not", "nth", "nthArg", "o", "objOf", "of", "omit", "on", "once", "or", "otherwise", "over", "pair", "partial",
  "partialRight", "partition", "path", "paths", "pathEq", "pathOr", "pathSatisfies", "pick", "pickAll", "pickBy", "pipe",
  "pipeWith", "pluck", "prepend", "product", "project", "promap", "prop", "propEq", "propIs", "propOr", "propSatisfies",
  "props", "range", "reduce", "reduceBy", "reduceRight", "reduceWhile", "reduced", "reject", "remove", "repeat", "replace",
  "reverse", "scan", "sequence", "set", "slice", "sort", "sortBy", "sortWith", "split", "splitAt", "splitEvery", "splitWhen",
  "splitWhenever", "startsWith", "subtract", "sum", "swap", "symmetricDifference", "symmetricDifferenceWith", "tail", "take",
  "takeLast", "takeLastWhile", "takeWhile", "tap", "test", "andThen", "times", "toLower", "toPairs", "toPairsIn", "toString",
  "toUpper", "transduce", "transpose", "traverse", "trim", "tryCatch", "type", "unapply", "unary", "uncurryN", "unfold",
  "union", "unionWith", "uniq", "uniqBy", "uniqWith", "unless", "unnest", "until", "unwind", "update", "useWith", "values",
  "valuesIn", "view", "when", "where", "whereAny", "whereEq", "without", "xor", "xprod", "zip", "zipObj", "zipWith", "thunkify"
];

modules.forEach(mod => {
  module.exports[mod] = /*#__PURE__*/require(`./${mod}.js`);
});
