const F = require("./F.js");
const T = require("./T.js");
const __ = require("./__.js");
const add = require("./add.js");
const addIndex = require("./addIndex.js");
const addIndexRight = require("./addIndexRight.js");
const adjust = require("./adjust.js");
const all = require("./all.js");
const allPass = require("./allPass.js");
const always = require("./always.js");
const and = require("./and.js");
const any = require("./any.js");
const anyPass = require("./anyPass.js");
const ap = require("./ap.js");
const aperture = require("./aperture.js");
const append = require("./append.js");
const apply = require("./apply.js");
const applySpec = require("./applySpec.js");
const applyTo = require("./applyTo.js");
const ascend = require("./ascend.js");
const ascendNatural = require("./ascendNatural.js");
const assoc = require("./assoc.js");
const assocPath = require("./assocPath.js");
const binary = require("./binary.js");
const bind = require("./bind.js");
const both = require("./both.js");
const call = require("./call.js");
const chain = require("./chain.js");
const clamp = require("./clamp.js");
const clone = require("./clone.js");
const collectBy = require("./collectBy.js");
const comparator = require("./comparator.js");
const complement = require("./complement.js");
const compose = require("./compose.js");
const composeWith = require("./composeWith.js");
const concat = require("./concat.js");
const cond = require("./cond.js");
const construct = require("./construct.js");
const constructN = require("./constructN.js");
const converge = require("./converge.js");
const count = require("./count.js");
const countBy = require("./countBy.js");
const curry = require("./curry.js");
const curryN = require("./curryN.js");
const dec = require("./dec.js");
const defaultTo = require("./defaultTo.js");
const descend = require("./descend.js");
const descendNatural = require("./descendNatural.js");
const difference = require("./difference.js");
const differenceWith = require("./differenceWith.js");
const dissoc = require("./dissoc.js");
const dissocPath = require("./dissocPath.js");
const divide = require("./divide.js");
const drop = require("./drop.js");
const dropLast = require("./dropLast.js");
const dropLastWhile = require("./dropLastWhile.js");
const dropRepeats = require("./dropRepeats.js");
const dropRepeatsBy = require("./dropRepeatsBy.js");
const dropRepeatsWith = require("./dropRepeatsWith.js");
const dropWhile = require("./dropWhile.js");
const either = require("./either.js");
const empty = require("./empty.js");
const endsWith = require("./endsWith.js");
const eqBy = require("./eqBy.js");
const eqProps = require("./eqProps.js");
const equals = require("./equals.js");
const evolve = require("./evolve.js");
const filter = require("./filter.js");
const find = require("./find.js");
const findIndex = require("./findIndex.js");
const findLast = require("./findLast.js");
const findLastIndex = require("./findLastIndex.js");
const flatten = require("./flatten.js");
const flip = require("./flip.js");
const flow = require("./flow.js");
const forEach = require("./forEach.js");
const forEachObjIndexed = require("./forEachObjIndexed.js");
const fromPairs = require("./fromPairs.js");
const groupBy = require("./groupBy.js");
const groupWith = require("./groupWith.js");
const gt = require("./gt.js");
const gte = require("./gte.js");
const has = require("./has.js");
const hasIn = require("./hasIn.js");
const hasPath = require("./hasPath.js");
const head = require("./head.js");
const identical = require("./identical.js");
const identity = require("./identity.js");
const ifElse = require("./ifElse.js");
const inc = require("./inc.js");
const includes = require("./includes.js");
const indexBy = require("./indexBy.js");
const indexOf = require("./indexOf.js");
const init = require("./init.js");
const innerJoin = require("./innerJoin.js");
const insert = require("./insert.js");
const insertAll = require("./insertAll.js");
const intersection = require("./intersection.js");
const intersperse = require("./intersperse.js");
const into = require("./into.js");
const invert = require("./invert.js");
const invertObj = require("./invertObj.js");
const invoker = require("./invoker.js");
const is = require("./is.js");
const isEmpty = require("./isEmpty.js");
const isNil = require("./isNil.js");
const isNotEmpty = require("./isNotEmpty.js");
const isNotNil = require("./isNotNil.js");
const join = require("./join.js");
const juxt = require("./juxt.js");
const keys = require("./keys.js");
const keysIn = require("./keysIn.js");
const last = require("./last.js");
const lastIndexOf = require("./lastIndexOf.js");
const length = require("./length.js");
const lens = require("./lens.js");
const lensIndex = require("./lensIndex.js");
const lensPath = require("./lensPath.js");
const lensProp = require("./lensProp.js");
const lift = require("./lift.js");
const liftN = require("./liftN.js");
const lt = require("./lt.js");
const lte = require("./lte.js");
const map = require("./map.js");
const mapAccum = require("./mapAccum.js");
const mapAccumRight = require("./mapAccumRight.js");
const mapObjIndexed = require("./mapObjIndexed.js");
const match = require("./match.js");
const mathMod = require("./mathMod.js");
const max = require("./max.js");
const maxBy = require("./maxBy.js");
const mean = require("./mean.js");
const median = require("./median.js");
const memoizeWith = require("./memoizeWith.js");
const mergeAll = require("./mergeAll.js");
const mergeDeepLeft = require("./mergeDeepLeft.js");
const mergeDeepRight = require("./mergeDeepRight.js");
const mergeDeepWith = require("./mergeDeepWith.js");
const mergeDeepWithKey = require("./mergeDeepWithKey.js");
const mergeLeft = require("./mergeLeft.js");
const mergeRight = require("./mergeRight.js");
const mergeWith = require("./mergeWith.js");
const mergeWithKey = require("./mergeWithKey.js");
const min = require("./min.js");
const minBy = require("./minBy.js");
const modify = require("./modify.js");
const modifyPath = require("./modifyPath.js");
const modulo = require("./modulo.js");
const move = require("./move.js");
const multiply = require("./multiply.js");
const nAry = require("./nAry.js");
const partialObject = require("./partialObject.js");
const negate = require("./negate.js");
const none = require("./none.js");
const not = require("./not.js");
const nth = require("./nth.js");
const nthArg = require("./nthArg.js");
const o = require("./o.js");
const objOf = require("./objOf.js");
const of = require("./of.js");
const omit = require("./omit.js");
const on = require("./on.js");
const once = require("./once.js");
const or = require("./or.js");
const otherwise = require("./otherwise.js");
const over = require("./over.js");
const pair = require("./pair.js");
const partial = require("./partial.js");
const partialRight = require("./partialRight.js");
const partition = require("./partition.js");
const path = require("./path.js");
const paths = require("./paths.js");
const pathEq = require("./pathEq.js");
const pathOr = require("./pathOr.js");
const pathSatisfies = require("./pathSatisfies.js");
const pick = require("./pick.js");
const pickAll = require("./pickAll.js");
const pickBy = require("./pickBy.js");
const pipe = require("./pipe.js");
const pipeWith = require("./pipeWith.js");
const pluck = require("./pluck.js");
const prepend = require("./prepend.js");
const product = require("./product.js");
const project = require("./project.js");
const promap = require("./promap.js");
const prop = require("./prop.js");
const propEq = require("./propEq.js");
const propIs = require("./propIs.js");
const propOr = require("./propOr.js");
const propSatisfies = require("./propSatisfies.js");
const props = require("./props.js");
const range = require("./range.js");
const reduce = require("./reduce.js");
const reduceBy = require("./reduceBy.js");
const reduceRight = require("./reduce.js");
const reduceWhile = require("./reduceWhile.js");
const reduced = require("./reduced.js");
const reject = require("./reject.js");
const remove = require("./remove.js");
const repeat = require("./repeat.js");
const replace = require("./replace.js");
const reverse = require("./reverse.js");
const scan = require("./scan.js");
const sequence = require("./sequence.js");
const set = require("./set.js");
const slice = require("./slice.js");
const sort = require("./sort.js");
const sortBy = require("./sortBy.js");
const sortWith = require("./sortWith.js");
const split = require("./split.js");
const splitAt = require("./splitAt.js");
const splitEvery = require("./splitEvery.js");
const splitWhen = require("./splitWhen.js");
const splitWhenever = require("./splitWhenever.js");
const startsWith = require("./startsWith.js");
const subtract = require("./subtract.js");
const sum = require("./sum.js");
const swap = require("./swap.js");
const symmetricDifference = require("./symmetricDifference.js");
const symmetricDifferenceWith = require("./symmetricDifferenceWith.js");
const tail = require("./tail.js");
const take = require("./take.js");
const takeLast = require("./takeLast.js");
const takeLastWhile = require("./takeLastWhile.js");
const takeWhile = require("./takeWhile.js");
const tap = require("./tap.js");
const test = require("./test.js");
const andThen = require("./andThen.js");
const times = require("./times.js");
const toLower = require("./toLower.js");
const toPairs = require("./toPairs.js");
const toPairsIn = require("./toPairsIn.js");
const toString = require("./toString.js");
const toUpper = require("./toUpper.js");
const transduce = require("./transduce.js");
const transpose = require("./transpose.js");
const traverse = require("./traverse.js");
const trim = require("./trim.js");
const tryCatch = require("./tryCatch.js");
const type = require("./type.js");
const unapply = require("./unapply.js");
const unary = require("./unary.js");
const uncurryN = require("./uncurryN.js");
const unfold = require("./unfold.js");
const union = require("./union.js");
const unionWith = require("./unionWith.js");
const uniq = require("./uniq.js");
const uniqBy = require("./uniqBy.js");
const uniqWith = require("./uniqWith.js");
const unless = require("./unless.js");
const unnest = require("./unnest.js");
const until = require("./until.js");
const unwind = require("./unwind.js");
const update = require("./update.js");
const useWith = require("./useWith.js");
const values = require("./values.js");
const valuesIn = require("./valuesIn.js");
const view = require("./view.js");
const when = require("./when.js");
const where = require("./where.js");
const whereAny = require("./whereAny.js");
const whereEq = require("./whereEq.js");
const without = require("./without.js");
const xor = require("./xor.js");
const xprod = require("./xprod.js");
const zip = require("./zip.js");
const zipObj = require("./zipObj.js");
const zipWith = require("./zipWith.js");
const thunkify = require("./thunkify.js");

module.exports = {
  F,
  T,
  __,
  add,
  addIndex,
  addIndexRight,
  adjust,
  all,
  allPass,
  always,
  and,
  any,
  anyPass,
  ap,
  aperture,
  append,
  apply,
  applySpec,
  applyTo,
  ascend,
  ascendNatural,
  assoc,
  assocPath,
  binary,
  bind,
  both,
  call,
  chain,
  clamp,
  clone,
  collectBy,
  comparator,
  complement,
  compose,
  composeWith,
  concat,
  cond,
  construct,
  constructN,
  converge,
  count,
  countBy,
  curry,
  curryN,
  dec,
  defaultTo,
  descend,
  descendNatural,
  difference,
  differenceWith,
  dissoc,
  dissocPath,
  divide,
  drop,
  dropLast,
  dropLastWhile,
  dropRepeats,
  dropRepeatsBy,
  dropRepeatsWith,
  dropWhile,
  either,
  empty,
  endsWith,
  eqBy,
  eqProps,
  equals,
  evolve,
  filter,
  find,
  findIndex,
  findLast,
  findLastIndex,
  flatten,
  flip,
  flow,
  forEach,
  forEachObjIndexed,
  fromPairs,
  groupBy,
  groupWith,
  gt,
  gte,
  has,
  hasIn,
  hasPath,
  head,
  identical,
  identity,
  ifElse,
  inc,
  includes,
  indexBy,
  indexOf,
  init,
  innerJoin,
  insert,
  insertAll,
  intersection,
  intersperse,
  into,
  invert,
  invertObj,
  invoker,
  is,
  isEmpty,
  isNil,
  isNotEmpty,
  isNotNil,
  join,
  juxt,
  keys,
  keysIn,
  last,
  lastIndexOf,
  length,
  lens,
  lensIndex,
  lensPath,
  lensProp,
  lift,
  liftN,
  lt,
  lte,
  map,
  mapAccum,
  mapAccumRight,
  mapObjIndexed,
  match,
  mathMod,
  max,
  maxBy,
  mean,
  median,
  memoizeWith,
  mergeAll,
  mergeDeepLeft,
  mergeDeepRight,
  mergeDeepWith,
  mergeDeepWithKey,
  mergeLeft,
  mergeRight,
  mergeWith,
  mergeWithKey,
  min,
  minBy,
  modify,
  modifyPath,
  modulo,
  move,
  multiply,
  nAry,
  partialObject,
  negate,
  none,
  not,
  nth,
  nthArg,
  o,
  objOf,
  of,
  omit,
  on,
  once,
  or,
  otherwise,
  over,
  pair,
  partial,
  partialRight,
  partition,
  path,
  paths,
  pathEq,
  pathOr,
  pathSatisfies,
  pick,
  pickAll,
  pickBy,
  pipe,
  pipeWith,
  pluck,
  prepend,
  product,
  project,
  promap,
  prop,
  propEq,
  propIs,
  propOr,
  propSatisfies,
  props,
  range,
  reduce,
  reduceBy,
  reduceRight,
  reduceWhile,
  reduced,
  reject,
  remove,
  repeat,
  replace,
  reverse,
  scan,
  sequence,
  set,
  slice,
  sort,
  sortBy,
  sortWith,
  split,
  splitAt,
  splitEvery,
  splitWhen,
  splitWhenever,
  startsWith,
  subtract,
  sum,
  swap,
  symmetricDifference,
  symmetricDifferenceWith,
  tail,
  take,
  takeLast,
  takeLastWhile,
  takeWhile,
  tap,
  test,
  andThen,
  times,
  toLower,
  toPairs,
  toPairsIn,
  toString,
  toUpper,
  transduce,
  transpose,
  traverse,
  trim,
  tryCatch,
  type,
  unapply,
  unary,
  uncurryN,
  unfold,
  union,
  unionWith,
  uniq,
  uniqBy,
  uniqWith,
  unless,
  unnest,
  until,
  unwind,
  update,
  useWith,
  values,
  valuesIn,
  view,
  when,
  where,
  whereAny,
  whereEq,
  without,
  xor,
  xprod,
  zip,
  zipObj,
  zipWith,
  thunkify
};
