// This Node.js code exports various scale functions from individual modules. 
// Each module provides a specific type of scale function, commonly used for data visualization and graph scaling.
// The exported functions include linear, logarithmic, ordinal, and time scales, among others.

export { default as scaleBand, point as scalePoint } from "./band.js"; // Exports scaleBand (default) and scalePoint from band.js
export { default as scaleIdentity } from "./identity.js"; // Exports scaleIdentity from identity.js
export { default as scaleLinear } from "./linear.js"; // Exports scaleLinear from linear.js
export { default as scaleLog } from "./log.js"; // Exports scaleLog from log.js
export { default as scaleSymlog } from "./symlog.js"; // Exports scaleSymlog from symlog.js
export { default as scaleOrdinal, implicit as scaleImplicit } from "./ordinal.js"; // Exports scaleOrdinal (default) and scaleImplicit from ordinal.js
export { default as scalePow, sqrt as scaleSqrt } from "./pow.js"; // Exports scalePow (default) and scaleSqrt from pow.js
export { default as scaleRadial } from "./radial.js"; // Exports scaleRadial from radial.js
export { default as scaleQuantile } from "./quantile.js"; // Exports scaleQuantile from quantile.js
export { default as scaleQuantize } from "./quantize.js"; // Exports scaleQuantize from quantize.js
export { default as scaleThreshold } from "./threshold.js"; // Exports scaleThreshold from threshold.js
export { default as scaleTime } from "./time.js"; // Exports scaleTime from time.js
export { default as scaleUtc } from "./utcTime.js"; // Exports scaleUtc from utcTime.js
export { 
  default as scaleSequential, 
  sequentialLog as scaleSequentialLog, 
  sequentialPow as scaleSequentialPow, 
  sequentialSqrt as scaleSequentialSqrt, 
  sequentialSymlog as scaleSequentialSymlog 
} from "./sequential.js"; // Exports a variety of sequential scale types from sequential.js
export { default as scaleSequentialQuantile } from "./sequentialQuantile.js"; // Exports scaleSequentialQuantile from sequentialQuantile.js
export { 
  default as scaleDiverging, 
  divergingLog as scaleDivergingLog, 
  divergingPow as scaleDivergingPow, 
  divergingSqrt as scaleDivergingSqrt, 
  divergingSymlog as scaleDivergingSymlog 
} from "./diverging.js"; // Exports a variety of diverging scale types from diverging.js
export { default as tickFormat } from "./tickFormat.js"; // Exports tickFormat from tickFormat.js
