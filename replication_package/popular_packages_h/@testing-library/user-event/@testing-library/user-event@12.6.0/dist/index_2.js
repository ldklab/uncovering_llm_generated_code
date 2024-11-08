"use strict";

// Export the "specialChars" from the "./type" module under the "specialCharMap" alias
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "specialChars", {
  enumerable: true,
  get: function () {
    return _type.specialCharMap;
  }
});

// Importing various interaction functionalities from different modules
var _click = require("./click");
var _type = require("./type");
var _clear = require("./clear");
var _tab = require("./tab");
var _hover = require("./hover");
var _upload = require("./upload");
var _selectOptions = require("./select-options");
var _paste = require("./paste");

// Aggregating the imported functionalities into a single userEvent object
const userEvent = {
  click: _click.click,
  dblClick: _click.dblClick,
  type: _type.type,
  clear: _clear.clear,
  tab: _tab.tab,
  hover: _hover.hover,
  unhover: _hover.unhover,
  upload: _upload.upload,
  selectOptions: _selectOptions.selectOptions,
  deselectOptions: _selectOptions.deselectOptions,
  paste: _paste.paste
};

// Exporting the constructed userEvent object as the default export
var _default = userEvent;
exports.default = _default;
