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
  // Validation of input elements to ensure they are HTMLElements
  if (!(referenceElement instanceof HTMLElement) || !(floatingElement instanceof HTMLElement)) {
    throw new Error('Invalid element(s) provided.');
  }

  // Compute the position using the computePosition function
  const positionData = await computePosition(referenceElement, floatingElement, options);

  // Set the computed position for the floating element in the DOM
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
 *   // Other positioning options...
 * }).then(positionData => {
 *   console.log('Positioned at:', positionData);
 * }).catch(error => {
 *   console.error('Positioning failed:', error);
 * });
 */

// Export the module's primary function
export default {
  positionFloatingElement,
};
