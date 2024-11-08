// index.js
import { createElement, useState } from './react';
import { createRoot } from './react-dom';

// A functional component 'Counter' that displays a count and a button to increment it
function Counter() {
  const [count, setCount] = useState(0); // Initialize state with a count of 0
  return createElement(
    'div', // Parent div element
    null,
    createElement('h1', null, count), // Display current count
    createElement(
      'button', // Button to increment count
      {
        onClick: () => setCount(count + 1) // Event handler to increment count
      },
      'Increment' // Button text
    )
  );
}

// 'App' component wraps 'Counter' component
function App() {
  return createElement(Counter, null);
}

// Get reference to the root DOM node and create a root object
const rootNode = document.getElementById('root');
const root = createRoot(rootNode);

// Initial rendering of the App component
root.render(createElement(App, null));

// react.js
export function useState(initialValue) {
  let _val = initialValue; // Private variable to hold state value
  function state() {
    return _val; // Return the current state value
  }
  function setState(newVal) {
    _val = newVal; // Update state value
    // re-render logic would be triggered here
  }
  return [state, setState]; // Return state and setState functions
}

export function createElement(type, props, ...children) {
  // Create a virtual DOM object
  return { type, props: props || {}, children };
}

// react-dom.js
export function createRoot(container) {
  return {
    render(element) {
      container.innerHTML = ''; // Clear existing contents in container
      const renderedElement = renderElement(element); // Convert virtual DOM to actual DOM
      container.appendChild(renderedElement); // Append new DOM element to container
    },
  };
}

function renderElement(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node); // Create text node for strings/numbers
  }

  const { type, props, children } = node;

  if (typeof type === 'function') {
    return renderElement(type(props)); // Handle functional components
  }

  const domElement = document.createElement(type); // Create DOM element for non-functional components

  for (let [name, value] of Object.entries(props)) {
    if (name.startsWith('on') && name.toLowerCase() in window) {
      domElement.addEventListener(name.toLowerCase().substr(2), value); // Add event listener for 'on*' props
    } else {
      domElement.setAttribute(name, value); // Set other attributes
    }
  }

  for (let child of children) {
    domElement.appendChild(renderElement(child)); // Recursively render and append children
  }

  return domElement;
}
