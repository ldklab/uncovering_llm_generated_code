import { Axis, AxisDelta, BoxDelta, AxisBox2D } from "../../types/geometry";
/**
 * Returns true if the provided value is within maxDistance of the provided target
 */
export declare function isNear(value: number, target?: number, maxDistance?: number): boolean;
/**
 * Calculate a transform origin relative to the source axis, between 0-1, that results
 * in an asthetically pleasing scale/transform needed to project from source to target.
 */
export declare function calcOrigin(source: Axis, target: Axis): number;
/**
 * Update the AxisDelta with a transform that projects source into target.
 *
 * The transform `origin` is optional. If not provided, it'll be automatically
 * calculated based on the relative positions of the two bounding boxes.
 */
export declare function updateAxisDelta(delta: AxisDelta, source: Axis, target: Axis, origin?: number): void;
/**
 * Update the BoxDelta with a transform that projects the source into the target.
 *
 * The transform `origin` is optional. If not provided, it'll be automatically
 * calculated based on the relative positions of the two bounding boxes.
 */
export declare function updateBoxDelta(delta: BoxDelta, source: AxisBox2D, target: AxisBox2D, origin?: number): void;
