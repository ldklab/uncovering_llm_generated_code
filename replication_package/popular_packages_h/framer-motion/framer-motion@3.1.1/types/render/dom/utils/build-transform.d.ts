import { TransformTemplate } from "../../../motion/types";
import { ResolvedValues } from "../../VisualElement/types";
import { Point2D, BoxDelta } from "../../../types/geometry";
import { TransformOrigin } from "../types";
/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
export declare function buildTransform(transform: ResolvedValues, transformKeys: string[], transformTemplate: TransformTemplate | undefined, transformIsDefault: boolean, enableHardwareAcceleration?: boolean, allowTransformNone?: boolean): string;
/**
 * Build a transformOrigin style. Uses the same defaults as the browser for
 * undefined origins.
 */
export declare function buildTransformOrigin({ originX, originY, originZ, }: TransformOrigin): string;
/**
 * Build a transform style that takes a calculated delta between the element's current
 * space on screen and projects it into the desired space.
 */
export declare function buildLayoutProjectionTransform({ x, y }: BoxDelta, treeScale: Point2D, latestTransform?: ResolvedValues): string;
export declare const identityProjection: string;
/**
 * Take the calculated delta origin and apply it as a transform string.
 */
export declare function buildLayoutProjectionTransformOrigin({ x, y }: BoxDelta): string;
