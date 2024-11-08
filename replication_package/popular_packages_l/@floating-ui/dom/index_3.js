// This code defines a method to position a floating DOM element relative to a reference element 
// using the computePosition function from the '@floating-ui/core' library. The function ensures 
// that valid HTMLElement instances are given and applies the computed position to the floating element.

import { computePosition } from '@floating-ui/core';

/**
 * Positions a floating element relative to a reference element.
 * 
 * @param {HTMLElement} referenceElement - The reference element to position against.
 * @param {HTMLElement} floatingElement - The element to position.
 * @param {Object} options - Configuration options for positioning.
 * 
 * @returns {Promise<Object>} - A promise that resolves with the positioning information.
 */
export async function positionFloatingElement(referenceElement, floatingElement, options) {
  // Ensure elements are provided and valid
  if (!(referenceElement instanceof HTMLElement) || !(floatingElement instanceof HTMLElement)) {
    throw new Error('Invalid element(s) provided.');
  }

  // Use the core computePosition logic to determine placement
  const positionData = await computePosition(referenceElement, floatingElement, options);

  // Apply the computed position to the floatingElement in the DOM
  Object.assign(floatingElement.style, {
    position: 'absolute',
    left: `${positionData.x}px`,
    top: `${positionData.y}px`,
  });

  return positionData;
}

// Export the primary function
export default {
  positionFloatingElement,
};
