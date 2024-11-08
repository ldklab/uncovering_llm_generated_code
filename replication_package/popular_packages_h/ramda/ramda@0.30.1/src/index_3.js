const utilities = {};

utilities.F = require("./F.js");
utilities.T = require("./T.js");
utilities.__ = require("./__.js");
utilities.add = require("./add.js");
utilities.addIndex = require("./addIndex.js");
utilities.addIndexRight = require("./addIndexRight.js");
utilities.adjust = require("./adjust.js");
utilities.all = require("./all.js");
utilities.allPass = require("./allPass.js");
utilities.always = require("./always.js");
utilities.and = require("./and.js");
utilities.any = require("./any.js");
utilities.anyPass = require("./anyPass.js");
utilities.ap = require("./ap.js");
utilities.aperture = require("./aperture.js");
utilities.append = require("./append.js");
utilities.apply = require("./apply.js");
utilities.applySpec = require("./applySpec.js");
utilities.applyTo = require("./applyTo.js");
utilities.ascend = require("./ascend.js");
utilities.ascendNatural = require("./ascendNatural.js");
utilities.assoc = require("./assoc.js");
utilities.assocPath = require("./assocPath.js");
utilities.binary = require("./binary.js");
utilities.bind = require("./bind.js");
utilities.both = require("./both.js");
utilities.call = require("./call.js");
utilities.chain = require("./chain.js");
utilities.clamp = require("./clamp.js");
utilities.clone = require("./clone.js");
utilities.collectBy = require("./collectBy.js");
utilities.comparator = require("./comparator.js");
utilities.complement = require("./complement.js");
utilities.compose = require("./compose.js");
utilities.composeWith = require("./composeWith.js");
utilities.concat = require("./concat.js");
utilities.cond = require("./cond.js");
utilities.construct = require("./construct.js");
utilities.constructN = require("./constructN.js");
utilities.converge = require("./converge.js");
utilities.count = require("./count.js");
utilities.countBy = require("./countBy.js");
utilities.curry = require("./curry.js");
utilities.curryN = require("./curryN.js");
utilities.dec = require("./dec.js");
utilities.defaultTo = require("./defaultTo.js");
utilities.descend = require("./descend.js");
utilities.descendNatural = require("./descendNatural.js");
utilities.difference = require("./difference.js");
utilities.differenceWith = require("./differenceWith.js");
utilities.dissoc = require("./dissoc.js");
utilities.dissocPath = require("./dissocPath.js");
utilities.divide = require("./divide.js");
utilities.drop = require("./drop.js");
utilities.dropLast = require("./dropLast.js");
utilities.dropLastWhile = require("./dropLastWhile.js");
utilities.dropRepeats = require("./dropRepeats.js");
utilities.dropRepeatsBy = require("./dropRepeatsBy.js");
utilities.dropRepeatsWith = require("./dropRepeatsWith.js");
utilities.dropWhile = require("./dropWhile.js");
utilities.either = require("./either.js");
utilities.empty = require("./empty.js");
utilities.endsWith = require("./endsWith.js");
utilities.eqBy = require("./eqBy.js");
utilities.eqProps = require("./eqProps.js");
utilities.equals = require("./equals.js");
utilities.evolve = require("./evolve.js");
utilities.filter = require("./filter.js");
utilities.find = require("./find.js");
utilities.findIndex = require("./findIndex.js");
utilities.findLast = require("./findLast.js");
utilities.findLastIndex = require("./findLastIndex.js");
utilities.flatten = require("./flatten.js");
utilities.flip = require("./flip.js");
utilities.flow = require("./flow.js");
utilities.forEach = require("./forEach.js");
utilities.forEachObjIndexed = require("./forEachObjIndexed.js");
utilities.fromPairs = require("./fromPairs.js");
utilities.groupBy = require("./groupBy.js");
utilities.groupWith = require("./groupWith.js");
utilities.gt = require("./gt.js");
utilities.gte = require("./gte.js");
utilities.has = require("./has.js");
utilities.hasIn = require("./hasIn.js");
utilities.hasPath = require("./hasPath.js");
utilities.head = require("./head.js");
utilities.identical = require("./identical.js");
utilities.identity = require("./identity.js");
utilities.ifElse = require("./ifElse.js");
utilities.inc = require("./inc.js");
utilities.includes = require("./includes.js");
utilities.indexBy = require("./indexBy.js");
utilities.indexOf = require("./indexOf.js");
utilities.init = require("./init.js");
utilities.innerJoin = require("./innerJoin.js");
utilities.insert = require("./insert.js");
utilities.insertAll = require("./insertAll.js");
utilities.intersection = require("./intersection.js");
utilities.intersperse = require("./intersperse.js");
utilities.into = require("./into.js");
utilities.invert = require("./invert.js");
utilities.invertObj = require("./invertObj.js");
utilities.invoker = require("./invoker.js");
utilities.is = require("./is.js");
utilities.isEmpty = require("./isEmpty.js");
utilities.isNil = require("./isNil.js");
utilities.isNotEmpty = require("./isNotEmpty.js");
utilities.isNotNil = require("./isNotNil.js");
utilities.join = require("./join.js");
utilities.juxt = require("./juxt.js");
utilities.keys = require("./keys.js");
utilities.keysIn = require("./keysIn.js");
utilities.last = require("./last.js");
utilities.lastIndexOf = require("./lastIndexOf.js");
utilities.length = require("./length.js");
utilities.lens = require("./lens.js");
utilities.lensIndex = require("./lensIndex.js");
utilities.lensPath = require("./lensPath.js");
utilities.lensProp = require("./lensProp.js");
utilities.lift = require("./lift.js");
utilities.liftN = require("./liftN.js");
utilities.lt = require("./lt.js");
utilities.lte = require("./lte.js");
utilities.map = require("./map.js");
utilities.mapAccum = require("./mapAccum.js");
utilities.mapAccumRight = require("./mapAccumRight.js");
utilities.mapObjIndexed = require("./mapObjIndexed.js");
utilities.match = require("./match.js");
utilities.mathMod = require("./mathMod.js");
utilities.max = require("./max.js");
utilities.maxBy = require("./maxBy.js");
utilities.mean = require("./mean.js");
utilities.median = require("./median.js");
utilities.memoizeWith = require("./memoizeWith.js");
utilities.mergeAll = require("./mergeAll.js");
utilities.mergeDeepLeft = require("./mergeDeepLeft.js");
utilities.mergeDeepRight = require("./mergeDeepRight.js");
utilities.mergeDeepWith = require("./mergeDeepWith.js");
utilities.mergeDeepWithKey = require("./mergeDeepWithKey.js");
utilities.mergeLeft = require("./mergeLeft.js");
utilities.mergeRight = require("./mergeRight.js");
utilities.mergeWith = require("./mergeWith.js");
utilities.mergeWithKey = require("./mergeWithKey.js");
utilities.min = require("./min.js");
utilities.minBy = require("./minBy.js");
utilities.modify = require("./modify.js");
utilities.modifyPath = require("./modifyPath.js");
utilities.modulo = require("./modulo.js");
utilities.move = require("./move.js");
utilities.multiply = require("./multiply.js");
utilities.nAry = require("./nAry.js");
utilities.partialObject = require("./partialObject.js");
utilities.negate = require("./negate.js");
utilities.none = require("./none.js");
utilities.not = require("./not.js");
utilities.nth = require("./nth.js");
utilities.nthArg = require("./nthArg.js");
utilities.o = require("./o.js");
utilities.objOf = require("./objOf.js");
utilities.of = require("./of.js");
utilities.omit = require("./omit.js");
utilities.on = require("./on.js");
utilities.once = require("./once.js");
utilities.or = require("./or.js");
utilities.otherwise = require("./otherwise.js");
utilities.over = require("./over.js");
utilities.pair = require("./pair.js");
utilities.partial = require("./partial.js");
utilities.partialRight = require("./partialRight.js");
utilities.partition = require("./partition.js");
utilities.path = require("./path.js");
utilities.paths = require("./paths.js");
utilities.pathEq = require("./pathEq.js");
utilities.pathOr = require("./pathOr.js");
utilities.pathSatisfies = require("./pathSatisfies.js");
utilities.pick = require("./pick.js");
utilities.pickAll = require("./pickAll.js");
utilities.pickBy = require("./pickBy.js");
utilities.pipe = require("./pipe.js");
utilities.pipeWith = require("./pipeWith.js");
utilities.pluck = require("./pluck.js");
utilities.prepend = require("./prepend.js");
utilities.product = require("./product.js");
utilities.project = require("./project.js");
utilities.promap = require("./promap.js");
utilities.prop = require("./prop.js");
utilities.propEq = require("./propEq.js");
utilities.propIs = require("./propIs.js");
utilities.propOr = require("./propOr.js");
utilities.propSatisfies = require("./propSatisfies.js");
utilities.props = require("./props.js");
utilities.range = require("./range.js");
utilities.reduce = require("./reduce.js");
utilities.reduceBy = require("./reduceBy.js");
utilities.reduceRight = require("./reduceRight.js");
utilities.reduceWhile = require("./reduceWhile.js");
utilities.reduced = require("./reduced.js");
utilities.reject = require("./reject.js");
utilities.remove = require("./remove.js");
utilities.repeat = require("./repeat.js");
utilities.replace = require("./replace.js");
utilities.reverse = require("./reverse.js");
utilities.scan = require("./scan.js");
utilities.sequence = require("./sequence.js");
utilities.set = require("./set.js");
utilities.slice = require("./slice.js");
utilities.sort = require("./sort.js");
utilities.sortBy = require("./sortBy.js");
utilities.sortWith = require("./sortWith.js");
utilities.split = require("./split.js");
utilities.splitAt = require("./splitAt.js");
utilities.splitEvery = require("./splitEvery.js");
utilities.splitWhen = require("./splitWhen.js");
utilities.splitWhenever = require("./splitWhenever.js");
utilities.startsWith = require("./startsWith.js");
utilities.subtract = require("./subtract.js");
utilities.sum = require("./sum.js");
utilities.swap = require("./swap.js");
utilities.symmetricDifference = require("./symmetricDifference.js");
utilities.symmetricDifferenceWith = require("./symmetricDifferenceWith.js");
utilities.tail = require("./tail.js");
utilities.take = require("./take.js");
utilities.takeLast = require("./takeLast.js");
utilities.takeLastWhile = require("./takeLastWhile.js");
utilities.takeWhile = require("./takeWhile.js");
utilities.tap = require("./tap.js");
utilities.test = require("./test.js");
utilities.andThen = require("./andThen.js");
utilities.times = require("./times.js");
utilities.toLower = require("./toLower.js");
utilities.toPairs = require("./toPairs.js");
utilities.toPairsIn = require("./toPairsIn.js");
utilities.toString = require("./toString.js");
utilities.toUpper = require("./toUpper.js");
utilities.transduce = require("./transduce.js");
utilities.transpose = require("./transpose.js");
utilities.traverse = require("./traverse.js");
utilities.trim = require("./trim.js");
utilities.tryCatch = require("./tryCatch.js");
utilities.type = require("./type.js");
utilities.unapply = require("./unapply.js");
utilities.unary = require("./unary.js");
utilities.uncurryN = require("./uncurryN.js");
utilities.unfold = require("./unfold.js");
utilities.union = require("./union.js");
utilities.unionWith = require("./unionWith.js");
utilities.uniq = require("./uniq.js");
utilities.uniqBy = require("./uniqBy.js");
utilities.uniqWith = require("./uniqWith.js");
utilities.unless = require("./unless.js");
utilities.unnest = require("./unnest.js");
utilities.until = require("./until.js");
utilities.unwind = require("./unwind.js");
utilities.update = require("./update.js");
utilities.useWith = require("./useWith.js");
utilities.values = require("./values.js");
utilities.valuesIn = require("./valuesIn.js");
utilities.view = require("./view.js");
utilities.when = require("./when.js");
utilities.where = require("./where.js");
utilities.whereAny = require("./whereAny.js");
utilities.whereEq = require("./whereEq.js");
utilities.without = require("./without.js");
utilities.xor = require("./xor.js");
utilities.xprod = require("./xprod.js");
utilities.zip = require("./zip.js");
utilities.zipObj = require("./zipObj.js");
utilities.zipWith = require("./zipWith.js");
utilities.thunkify = require("./thunkify.js");

module.exports = utilities;
