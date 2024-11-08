class DOMTestingLibrary {
  constructor(domString) {
    // Initialize a virtual DOM from the provided HTML string
    this.dom = new DOMParser().parseFromString(domString, 'text/html');
  }

  // Method to find elements containing specific text
  getByText(text) {
    return Array.from(this.dom.body.querySelectorAll("*"))
      .filter(element => element.textContent.includes(text));
  }

  // Method to find an element by its ID
  getById(id) {
    return this.dom.getElementById(id);
  }

  // Method to find elements by their tag name
  getByTagName(tagName) {
    return this.dom.getElementsByTagName(tagName);
  }
}

// Example usage
const htmlString = `
  <div>
    <h1 id="header">Welcome</h1>
    <p>This is a paragraph of text.</p>
  </div>
`;

const library = new DOMTestingLibrary(htmlString);

const heading = library.getById('header'); // <h1 id="header">Welcome</h1>
const paragraphs = library.getByTagName('p'); // Collection of <p> elements
const textElement = library.getByText('Welcome'); // Array containing <h1> element

// Exporting the class for use in other parts of the application
module.exports = DOMTestingLibrary;
