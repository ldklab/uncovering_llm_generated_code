// This Node.js code is a collection of export statements that regroup and rename
// exports from different module files. Each export statement imports a specific default
// or named export from a module file and re-exports them with a new naming convention.
// This is typically used to create a cohesive public API by consolidating related modules
// under a unified namespace.

export {
  default as scaleBand,
  point as scalePoint
} from "./band.js"; // Exports default as scaleBand and named export 'point' as scalePoint from band.js

export {
  default as scaleIdentity
} from "./identity.js"; // Exports the default export as scaleIdentity from identity.js

export {
  default as scaleLinear
} from "./linear.js"; // Exports the default export as scaleLinear from linear.js

export {
  default as scaleLog
} from "./log.js"; // Exports the default export as scaleLog from log.js

export {
  default as scaleSymlog
} from "./symlog.js"; // Exports the default export as scaleSymlog from symlog.js

export {
  default as scaleOrdinal,
  implicit as scaleImplicit
} from "./ordinal.js"; // Exports default as scaleOrdinal and named export 'implicit' as scaleImplicit from ordinal.js

export {
  default as scalePow,
  sqrt as scaleSqrt
} from "./pow.js"; // Exports default as scalePow and named export 'sqrt' as scaleSqrt from pow.js

export {
  default as scaleRadial
} from "./radial.js"; // Exports the default export as scaleRadial from radial.js

export {
  default as scaleQuantile
} from "./quantile.js"; // Exports the default export as scaleQuantile from quantile.js

export {
  default as scaleQuantize
} from "./quantize.js"; // Exports the default export as scaleQuantize from quantize.js

export {
  default as scaleThreshold
} from "./threshold.js"; // Exports the default export as scaleThreshold from threshold.js

export {
  default as scaleTime
} from "./time.js"; // Exports the default export as scaleTime from time.js

export {
  default as scaleUtc
} from "./utcTime.js"; // Exports the default export as scaleUtc from utcTime.js

export {
  default as scaleSequential,
  sequentialLog as scaleSequentialLog,
  sequentialPow as scaleSequentialPow,
  sequentialSqrt as scaleSequentialSqrt,
  sequentialSymlog as scaleSequentialSymlog
} from "./sequential.js"; // Exports default as scaleSequential and named exports as various sequential scales from sequential.js

export {
  default as scaleSequentialQuantile
} from "./sequentialQuantile.js"; // Exports the default export as scaleSequentialQuantile from sequentialQuantile.js

export {
  default as scaleDiverging,
  divergingLog as scaleDivergingLog,
  divergingPow as scaleDivergingPow,
  divergingSqrt as scaleDivergingSqrt,
  divergingSymlog as scaleDivergingSymlog
} from "./diverging.js"; // Exports default as scaleDiverging and named exports as various diverging scales from diverging.js

export {
  default as tickFormat
} from "./tickFormat.js"; // Exports the default export as tickFormat from tickFormat.js
