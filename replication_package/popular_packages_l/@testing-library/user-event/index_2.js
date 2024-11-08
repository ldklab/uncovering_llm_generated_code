// user-event/index.js

class UserEventHandler {
  constructor(dom) {
    if (!dom) {
      throw new Error("A DOM element must be provided.");
    }
    this.dom = dom;
  }

  triggerClick(targetElement) {
    if (!targetElement) throw new Error("You must provide an element to click.");
    if (typeof targetElement.click !== 'function') {
      throw new Error("Provided element does not have a click method.");
    }

    targetElement.click();
    if (targetElement.type === 'checkbox') {
      targetElement.checked = !targetElement.checked;
    }
  }

  insertText(element, text) {
    if (!element) throw new Error("You must provide an element to type into.");
    if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
      throw new Error("Typing is only supported on input or textarea elements.");
    }

    element.value = text;
  }
}

module.exports = UserEventHandler;

// Usage Example:
// const UserEventHandler = require('./user-event-handler');
// const userEventHandler = new UserEventHandler(document);
// userEventHandler.triggerClick(document.getElementById('myCheckbox'));
// userEventHandler.insertText(document.getElementById('myInput'), 'Hello World!');
