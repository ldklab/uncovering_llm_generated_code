// @floating-ui/dom/index.js

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
  // Verify that the provided elements are valid instances of HTMLElement
  if (!(referenceElement instanceof HTMLElement) || !(floatingElement instanceof HTMLElement)) {
    throw new Error('Invalid element(s) provided.');
  }

  // Compute the position using the core computePosition function
  const positionData = await computePosition(referenceElement, floatingElement, options);

  // Update the floatingElement's style in the DOM based on computed position
  Object.assign(floatingElement.style, {
    position: 'absolute',
    left: `${positionData.x}px`,
    top: `${positionData.y}px`,
  });

  return positionData;
}

/**
 * Example usage:
 * 
 * import { positionFloatingElement } from '@floating-ui/dom';
 * 
 * const referenceElement = document.querySelector('#reference');
 * const floatingElement = document.querySelector('#floating');
 * 
 * positionFloatingElement(referenceElement, floatingElement, {
 *   placement: 'bottom',
 *   // Additional positioning options...
 * }).then(positionData => {
 *   console.log('Positioned at:', positionData);
 * }).catch(error => {
 *   console.error('Positioning failed:', error);
 * });
 */

// Export the default object containing the primary function
export default {
  positionFloatingElement,
};
