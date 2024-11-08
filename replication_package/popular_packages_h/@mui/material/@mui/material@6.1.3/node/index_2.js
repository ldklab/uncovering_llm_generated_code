"use strict";

const { default: _interopRequireDefault } = require("@babel/runtime/helpers/interopRequireDefault");
const { default: _interopRequireWildcard } = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true,
});

const exportedNames = new Set([
  "colors", "Accordion", "AccordionActions", "AccordionDetails", "AccordionSummary", "Alert", "AlertTitle",
  "AppBar", "Autocomplete", "Avatar", "AvatarGroup", "Backdrop", "Badge", "BottomNavigation", "BottomNavigationAction",
  "Box", "Breadcrumbs", "Button", "ButtonBase", "ButtonGroup", "Card", "CardActionArea", "CardActions", 
  "CardContent", "CardHeader", "CardMedia", "Checkbox", "Chip", "CircularProgress", "ClickAwayListener", "Collapse",
  "Container", "CssBaseline", "darkScrollbar", "Dialog", "DialogActions", "DialogContent", "DialogContentText",
  "DialogTitle", "Divider", "Drawer", "Fab", "Fade", "FilledInput", "FormControl", "FormControlLabel",
  "FormGroup", "FormHelperText", "FormLabel", "Grid", "Grid2", "Grow", "Hidden", "Icon", "IconButton",
  "ImageList", "ImageListItem", "ImageListItemBar", "Input", "InputAdornment", "InputBase", "InputLabel",
  "LinearProgress", "Link", "List", "ListItem", "ListItemAvatar", "ListItemButton", "ListItemIcon",
  "ListItemSecondaryAction", "ListItemText", "ListSubheader", "Menu", "MenuItem", "MenuList", "MobileStepper",
  "Modal", "NativeSelect", "NoSsr", "OutlinedInput", "Pagination", "PaginationItem", "Paper", "Popover", 
  "Popper", "Portal", "Radio", "RadioGroup", "Rating", "ScopedCssBaseline", "Select", "Skeleton", "Slide", 
  "Slider", "Snackbar", "SnackbarContent", "SpeedDial", "SpeedDialAction", "SpeedDialIcon", "Stack", "Step", 
  "StepButton", "StepConnector", "StepContent", "StepIcon", "StepLabel", "Stepper", "SvgIcon", "SwipeableDrawer", 
  "Switch", "Tab", "TabScrollButton", "Table", "TableBody", "TableCell", "TableContainer", "TableFooter", 
  "TableHead", "TablePagination", "TableRow", "TableSortLabel", "Tabs", "TextField", "TextareaAutosize", 
  "ToggleButton", "ToggleButtonGroup", "Toolbar", "Tooltip", "Typography", "Unstable_TrapFocus", "Zoom", 
  "useMediaQuery", "usePagination", "useScrollTrigger", "useAutocomplete", "GlobalStyles", "unstable_composeClasses", 
  "generateUtilityClass", "generateUtilityClasses"
]);

function defineExport(name, getter) {
  if (!Object.prototype.hasOwnProperty.call(exports, name)) {
    Object.defineProperty(exports, name, {
      enumerable: true,
      get: getter,
    });
  }
}

const importAndExport = (module, ...names) => {
  const mod = _interopRequireWildcard(require(module));
  names.forEach(name => {
    defineExport(name, () => mod[name] || mod.default);
  });
};

// Import and export all components and utilities
importAndExport("./colors", "colors");
importAndExport("./Accordion", "Accordion");
importAndExport("./AccordionActions", "AccordionActions");
importAndExport("./AccordionDetails", "AccordionDetails");
importAndExport("./AccordionSummary", "AccordionSummary");
importAndExport("./Alert", "Alert");
importAndExport("./AlertTitle", "AlertTitle");
importAndExport("./AppBar", "AppBar");
importAndExport("./Autocomplete", "Autocomplete");
importAndExport("./Avatar", "Avatar");
importAndExport("./AvatarGroup", "AvatarGroup");
importAndExport("./Backdrop", "Backdrop");
importAndExport("./Badge", "Badge");
importAndExport("./BottomNavigation", "BottomNavigation");
importAndExport("./BottomNavigationAction", "BottomNavigationAction");
importAndExport("./Box", "Box");
importAndExport("./Breadcrumbs", "Breadcrumbs");
importAndExport("./Button", "Button");
importAndExport("./ButtonBase", "ButtonBase");
importAndExport("./ButtonGroup", "ButtonGroup");
importAndExport("./Card", "Card");
importAndExport("./CardActionArea", "CardActionArea");
importAndExport("./CardActions", "CardActions");
importAndExport("./CardContent", "CardContent");
importAndExport("./CardHeader", "CardHeader");
importAndExport("./CardMedia", "CardMedia");
importAndExport("./Checkbox", "Checkbox");
importAndExport("./Chip", "Chip");
importAndExport("./CircularProgress", "CircularProgress");
importAndExport("./ClickAwayListener", "ClickAwayListener");
importAndExport("./Collapse", "Collapse");
importAndExport("./Container", "Container");
importAndExport("./CssBaseline", "CssBaseline");
importAndExport("./Dialog", "Dialog");
importAndExport("./DialogActions", "DialogActions");
importAndExport("./DialogContent", "DialogContent");
importAndExport("./DialogContentText", "DialogContentText");
importAndExport("./DialogTitle", "DialogTitle");
importAndExport("./Divider", "Divider");
importAndExport("./Drawer", "Drawer");
importAndExport("./Fab", "Fab");
importAndExport("./Fade", "Fade");
importAndExport("./FilledInput", "FilledInput");
importAndExport("./FormControl", "FormControl");
importAndExport("./FormControlLabel", "FormControlLabel");
importAndExport("./FormGroup", "FormGroup");
importAndExport("./FormHelperText", "FormHelperText");
importAndExport("./FormLabel", "FormLabel");
importAndExport("./Grid", "Grid");
importAndExport("./Grid2", "Grid2");
importAndExport("./Grow", "Grow");
importAndExport("./Hidden", "Hidden");
importAndExport("./Icon", "Icon");
importAndExport("./IconButton", "IconButton");
importAndExport("./ImageList", "ImageList");
importAndExport("./ImageListItem", "ImageListItem");
importAndExport("./ImageListItemBar", "ImageListItemBar");
importAndExport("./Input", "Input");
importAndExport("./InputAdornment", "InputAdornment");
importAndExport("./InputBase", "InputBase");
importAndExport("./InputLabel", "InputLabel");
importAndExport("./LinearProgress", "LinearProgress");
importAndExport("./Link", "Link");
importAndExport("./List", "List");
importAndExport("./ListItem", "ListItem");
importAndExport("./ListItemAvatar", "ListItemAvatar");
importAndExport("./ListItemButton", "ListItemButton");
importAndExport("./ListItemIcon", "ListItemIcon");
importAndExport("./ListItemSecondaryAction", "ListItemSecondaryAction");
importAndExport("./ListItemText", "ListItemText");
importAndExport("./ListSubheader", "ListSubheader");
importAndExport("./Menu", "Menu");
importAndExport("./MenuItem", "MenuItem");
importAndExport("./MenuList", "MenuList");
importAndExport("./MobileStepper", "MobileStepper");
importAndExport("./Modal", "Modal");
importAndExport("./NativeSelect", "NativeSelect");
importAndExport("./NoSsr", "NoSsr");
importAndExport("./OutlinedInput", "OutlinedInput");
importAndExport("./Pagination", "Pagination");
importAndExport("./PaginationItem", "PaginationItem");
importAndExport("./Paper", "Paper");
importAndExport("./Popover", "Popover");
importAndExport("./Popper", "Popper");
importAndExport("./Portal", "Portal");
importAndExport("./Radio", "Radio");
importAndExport("./RadioGroup", "RadioGroup");
importAndExport("./Rating", "Rating");
importAndExport("./ScopedCssBaseline", "ScopedCssBaseline");
importAndExport("./Select", "Select");
importAndExport("./Skeleton", "Skeleton");
importAndExport("./Slide", "Slide");
importAndExport("./Slider", "Slider");
importAndExport("./Snackbar", "Snackbar");
importAndExport("./SnackbarContent", "SnackbarContent");
importAndExport("./SpeedDial", "SpeedDial");
importAndExport("./SpeedDialAction", "SpeedDialAction");
importAndExport("./SpeedDialIcon", "SpeedDialIcon");
importAndExport("./Stack", "Stack");
importAndExport("./Step", "Step");
importAndExport("./StepButton", "StepButton");
importAndExport("./StepConnector", "StepConnector");
importAndExport("./StepContent", "StepContent");
importAndExport("./StepIcon", "StepIcon");
importAndExport("./StepLabel", "StepLabel");
importAndExport("./Stepper", "Stepper");
importAndExport("./SvgIcon", "SvgIcon");
importAndExport("./SwipeableDrawer", "SwipeableDrawer");
importAndExport("./Switch", "Switch");
importAndExport("./Tab", "Tab");
importAndExport("./TabScrollButton", "TabScrollButton");
importAndExport("./Table", "Table");
importAndExport("./TableBody", "TableBody");
importAndExport("./TableCell", "TableCell");
importAndExport("./TableContainer", "TableContainer");
importAndExport("./TableFooter", "TableFooter");
importAndExport("./TableHead", "TableHead");
importAndExport("./TablePagination", "TablePagination");
importAndExport("./TableRow", "TableRow");
importAndExport("./TableSortLabel", "TableSortLabel");
importAndExport("./Tabs", "Tabs");
importAndExport("./TextField", "TextField");
importAndExport("./TextareaAutosize", "TextareaAutosize");
importAndExport("./ToggleButton", "ToggleButton");
importAndExport("./ToggleButtonGroup", "ToggleButtonGroup");
importAndExport("./Toolbar", "Toolbar");
importAndExport("./Tooltip", "Tooltip");
importAndExport("./Typography", "Typography");
importAndExport("./Unstable_TrapFocus", "Unstable_TrapFocus");
importAndExport("./Zoom", "Zoom");
importAndExport("./useAutocomplete", "useAutocomplete");
importAndExport("./useMediaQuery", "useMediaQuery");
importAndExport("./usePagination", "usePagination");
importAndExport("./useScrollTrigger", "useScrollTrigger");
importAndExport("./GlobalStyles", "GlobalStyles");
importAndExport("./darkScrollbar", "darkScrollbar");
importAndExport("./generateUtilityClass", "generateUtilityClass");
importAndExport("./generateUtilityClasses", "generateUtilityClasses");

// Import and export everything from styles and utils, observing export names
const _styles = require("./styles");
Object.keys(_styles).forEach(key => {
  if (!exportedNames.has(key)) {
    defineExport(key, () => _styles[key]);
  }
});

const _utils = require("./utils");
Object.keys(_utils).forEach(key => {
  if (!exportedNames.has(key)) {
    defineExport(key, () => _utils[key]);
  }
});

const _version = _interopRequireWildcard(require("./version"));
Object.keys(_version).forEach(key => {
  if (!exportedNames.has(key)) {
    defineExport(key, () => _version[key]);
  }
});
