"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", { value: true });

var _exportNames = {
  colors: true, Accordion: true, Alert: true, AppBar: true, Autocomplete: true, 
  Avatar: true, Backdrop: true, Badge: true, Box: true, Button: true, 
  Card: true, Checkbox: true, Chip: true, CircularProgress: true, Dialog: true, 
  Divider: true, Drawer: true, Fab: true, Fade: true, FormControl: true, 
  Grid: true, Icon: true, LinearProgress: true, Link: true, List: true, 
  Menu: true, Modal: true, Paper: true, Popover: true, Radio: true, 
  Select: true, Skeleton: true, Slide: true, Snackbar: true, SvgIcon: true, 
  Switch: true, Tab: true, Table: true, TextField: true, Toolbar: true, 
  Tooltip: true, Typography: true, Zoom: true, useMediaQuery: true, 
  usePagination: true, useScrollTrigger: true, GlobalStyles: true,
  unstable_composeClasses: true, generateUtilityClass: true, generateUtilityClasses: true, 
  Unstable_TrapFocus: true
};

// Import and export individual components
const names = [
  "Accordion", "Alert", "AppBar", "Autocomplete", "Avatar", "Backdrop", 
  "Badge", "Box", "Button", "Card", "Checkbox", "Chip", "CircularProgress", 
  "Dialog", "Divider", "Drawer", "Fab", "Fade", "FormControl", "Grid", 
  "Icon", "LinearProgress", "Link", "List", "Menu", "Modal", "Paper", 
  "Popover", "Radio", "Select", "Skeleton", "Slide", "Snackbar", "SvgIcon", 
  "Switch", "Tab", "Table", "TextField", "Toolbar", "Tooltip", "Typography", 
  "Zoom", "useMediaQuery", "usePagination", "useScrollTrigger", "GlobalStyles"
];

names.forEach(name => {
  var mod = _interopRequireDefault(require(`./${name}`));
  exports[name] = mod.default;
});

var modColors = _interopRequireWildcard(require("./colors"));
exports.colors = modColors;

var _utils2 = require("@mui/utils");
Object.defineProperty(exports, "unstable_composeClasses", {
  enumerable: true,
  get: function () {
    return _utils2.unstable_composeClasses;
  }
});

var _generateUtilityClass = require("./generateUtilityClass");
Object.keys(_generateUtilityClass).forEach(function (key) {
  if (!_exportNames[key] && key !== "__esModule" && key !== "default") {
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => _generateUtilityClass[key]
    });
  }
});

var _generateUtilityClasses = _interopRequireDefault(require("./generateUtilityClasses"));
exports.generateUtilityClasses = _generateUtilityClasses.default;

var _Unstable_TrapFocus = _interopRequireDefault(require("./Unstable_TrapFocus"));
exports.Unstable_TrapFocus = _Unstable_TrapFocus.default;

// More imports and checks for additional utilities
["useAutocomplete", "GlobalStyles"].forEach(util => {
  var mod = _interopRequireDefault(require(`./${util}`));
  exports[util] = mod.default;
});
