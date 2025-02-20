import { PanHandlers } from "./use-pan-gesture";
import { TapHandlers } from "./use-tap-gesture";
import { HoverHandlers } from "./use-hover-gesture";
import { FocusHandlers } from "./use-focus-gesture";
import { VisualElement } from "../render/VisualElement";
/**
 * @public
 */
export declare type GestureHandlers = PanHandlers & TapHandlers & HoverHandlers & FocusHandlers;
/**
 * Add pan and tap gesture recognition to an element.
 *
 * @param props - Gesture event handlers
 * @param ref - React `ref` containing a DOM `Element`
 * @public
 */
export declare function useGestures<GestureHandlers>(props: GestureHandlers, visualElement: VisualElement): void;
