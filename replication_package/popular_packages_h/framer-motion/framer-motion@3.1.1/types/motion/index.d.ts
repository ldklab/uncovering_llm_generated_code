import * as React from "react";
import { MotionProps } from "./types";
import { UseVisualElement } from "../render/VisualElement/types";
import { RenderComponent, MotionFeature } from "./features/types";
export { MotionProps };
export interface MotionComponentConfig<E> {
    defaultFeatures: MotionFeature[];
    useVisualElement: UseVisualElement<E>;
    useRender: RenderComponent;
}
/**
 * Create a `motion` component.
 *
 * This function accepts a Component argument, which can be either a string (ie "div"
 * for `motion.div`), or an actual React component.
 *
 * Alongside this is a config option which provides a way of rendering the provided
 * component "offline", or outside the React render cycle.
 *
 * @internal
 */
export declare function createMotionComponent<P extends {}, E>(Component: string | React.ComponentType<P>, { defaultFeatures, useVisualElement, useRender }: MotionComponentConfig<E>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P & MotionProps> & React.RefAttributes<E>>;
