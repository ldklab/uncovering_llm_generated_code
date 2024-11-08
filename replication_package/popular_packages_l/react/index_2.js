// index.js
import { createElement, useState } from './react'; // Importing createElement and useState from a custom module
import { createRoot } from './react-dom'; // Importing createRoot from a custom module

// Counter component - a simple functional component using a custom React-like API
function Counter() {
  const [count, setCount] = useState(0); // Initialize state with 0 and provide a function to update it
  return createElement(
    'div',
    null,
    createElement('h1', null, count), // Display current count value
    createElement(
      'button',
      {
        onClick: () => setCount(count + 1) // Increment count when button is clicked
      },
      'Increment' // Button label
    )
  );
}

// App component - the main application component
function App() {
  return createElement(Counter, null); // Rendering the Counter component
}

// Set up rendering for our application inside the DOM element with 'root' as the id
const rootNode = document.getElementById('root'); 
const root = createRoot(rootNode);

// Render the App component into the root element
root.render(createElement(App, null));

// react.js
// Custom implementation of useState for managing component state
export function useState(initialValue) {
  let _val = initialValue; // Store state inside closure
  function state() {
    return _val; // Getter function for state
  }
  function setState(newVal) {
    _val = newVal; // Setter function for state, no rerender logic implemented
  }
  return [state, setState]; // Return state and setState as a pair
}

// Custom implementation of createElement for creating virtual DOM nodes
export function createElement(type, props, ...children) {
  return { type, props: props || {}, children }; // Virtual node definition
}

// react-dom.js
// Custom implementation for setting up rendering of virtual DOM
export function createRoot(container) {
  return {
    render(element) {
      container.innerHTML = ''; // Clear container before rendering
      const renderedElement = renderElement(element); // Convert virtual DOM element to real DOM
      container.appendChild(renderedElement); // Append to container
    },
  };
}

// Recursive function to convert virtual DOM nodes to real DOM nodes
function renderElement(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(node); // Handle text nodes
  }

  const { type, props, children } = node;

  if (typeof type === 'function') {
    return renderElement(type(props)); // If component, recursively call renderElement
  }

  const domElement = document.createElement(type); // Create DOM element

  for (let [name, value] of Object.entries(props)) {
    if (name.startsWith('on') && name.toLowerCase() in window) {
      domElement.addEventListener(name.toLowerCase().substr(2), value); // Add event listeners
    } else {
      domElement.setAttribute(name, value); // Set attributes
    }
  }

  for (let child of children) {
    domElement.appendChild(renderElement(child)); // Append child nodes
  }

  return domElement; // Return the constructed element
}
