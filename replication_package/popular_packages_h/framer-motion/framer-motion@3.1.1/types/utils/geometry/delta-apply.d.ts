import { Axis, AxisBox2D, BoxDelta, Point2D } from "../../types/geometry";
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement";
import { ResolvedValues } from "../../render/VisualElement/types";
/**
 * Reset an axis to the provided origin box.
 *
 * This is a mutative operation.
 */
export declare function resetAxis(axis: Axis, originAxis: Axis): void;
/**
 * Reset a box to the provided origin box.
 *
 * This is a mutative operation.
 */
export declare function resetBox(box: AxisBox2D, originBox: AxisBox2D): void;
/**
 * Scales a point based on a factor and an originPoint
 */
export declare function scalePoint(point: number, scale: number, originPoint: number): number;
/**
 * Applies a translate/scale delta to a point
 */
export declare function applyPointDelta(point: number, translate: number, scale: number, originPoint: number, boxScale?: number): number;
/**
 * Applies a translate/scale delta to an axis
 */
export declare function applyAxisDelta(axis: Axis, translate: number | undefined, scale: number | undefined, originPoint: number, boxScale?: number): void;
/**
 * Applies a translate/scale delta to a box
 */
export declare function applyBoxDelta(box: AxisBox2D, { x, y }: BoxDelta): void;
/**
 * Apply a transform to an axis from the latest resolved motion values.
 * This function basically acts as a bridge between a flat motion value map
 * and applyAxisDelta
 */
export declare function applyAxisTransforms(final: Axis, axis: Axis, transforms: ResolvedValues, [key, scaleKey, originKey]: string[]): void;
/**
 * Apply a transform to a box from the latest resolved motion values.
 */
export declare function applyBoxTransforms(finalBox: AxisBox2D, box: AxisBox2D, transforms: ResolvedValues): void;
/**
 * Remove a delta from a point. This is essentially the steps of applyPointDelta in reverse
 */
export declare function removePointDelta(point: number, translate: number, scale: number, originPoint: number, boxScale?: number): number;
/**
 * Remove a delta from an axis. This is essentially the steps of applyAxisDelta in reverse
 */
export declare function removeAxisDelta(axis: Axis, translate?: number, scale?: number, origin?: number, boxScale?: number): void;
/**
 * Remove a transforms from an axis. This is essentially the steps of applyAxisTransforms in reverse
 * and acts as a bridge between motion values and removeAxisDelta
 */
export declare function removeAxisTransforms(axis: Axis, transforms: ResolvedValues, [key, scaleKey, originKey]: string[]): void;
/**
 * Remove a transforms from an box. This is essentially the steps of applyAxisBox in reverse
 * and acts as a bridge between motion values and removeAxisDelta
 */
export declare function removeBoxTransforms(box: AxisBox2D, transforms: ResolvedValues): void;
/**
 * Apply a tree of deltas to a box. We do this to calculate the effect of all the transforms
 * in a tree upon our box before then calculating how to project it into our desired viewport-relative box
 *
 * This is the final nested loop within HTMLVisualElement.updateLayoutDelta
 */
export declare function applyTreeDeltas(box: AxisBox2D, treeScale: Point2D, treePath: HTMLVisualElement[]): void;
