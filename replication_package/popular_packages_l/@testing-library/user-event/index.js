// user-event/index.js

class UserEvent {
  constructor(dom) {
    if (!dom) {
      throw new Error("A DOM element must be provided.");
    }
    this.dom = dom;
  }

  click(element) {
    if (!element) throw new Error("You must provide an element to click.");
    if (typeof element.click !== 'function') {
      throw new Error("Provided element does not have a click method.");
    }

    element.click();
    if (element.type === 'checkbox') {
      element.checked = !element.checked;
    }
  }

  type(element, text) {
    if (!element) throw new Error("You must provide an element to type into.");
    if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
      throw new Error("Typing is only supported on input or textarea elements.");
    }

    element.value = text;
  }
}

module.exports = UserEvent;

// Usage Example:
// const UserEvent = require('./user-event');
// const userEvent = new UserEvent(document);
// userEvent.click(document.getElementById('myCheckbox'));
// userEvent.type(document.getElementById('myInput'), 'Hello World!');
