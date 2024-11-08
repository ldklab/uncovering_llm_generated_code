import ansiStyles from '#ansi-styles';
import supportsColor from '#supports-color';
import { stringReplaceAll, stringEncaseCRLFWithFirstIndex } from './utilities.js';

const { stdout: stdoutColor, stderr: stderrColor } = supportsColor;

const GENERATOR = Symbol('GENERATOR');
const STYLER = Symbol('STYLER');
const IS_EMPTY = Symbol('IS_EMPTY');

const levelMapping = ['ansi', 'ansi', 'ansi256', 'ansi16m'];
const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error('The `level` option should be an integer from 0 to 3');
  }
  object.level = options.level === undefined ? (stdoutColor ? stdoutColor.level : 0) : options.level;
};

export class Chalk {
  constructor(options) {
    return chalkFactory(options);
  }
}

const chalkFactory = options => {
  const chalk = (...strings) => strings.join(' ');
  applyOptions(chalk, options);
  Object.setPrototypeOf(chalk, createChalk.prototype);
  return chalk;
};

function createChalk(options) {
  return chalkFactory(options);
}

Object.setPrototypeOf(createChalk.prototype, Function.prototype);

for (const [styleName, style] of Object.entries(ansiStyles)) {
  styles[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}

styles.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, 'visible', { value: builder });
    return builder;
  }
};

const getModelAnsi = (model, level, type, ...args) => {
  if (model === 'rgb') {
    if (level === 'ansi16m') {
      return ansiStyles[type].ansi16m(...args);
    }
    if (level === 'ansi256') {
      return ansiStyles[type].ansi256(ansiStyles.rgbToAnsi256(...args));
    }
    return ansiStyles[type].ansi(ansiStyles.rgbToAnsi(...args));
  }
  if (model === 'hex') {
    return getModelAnsi('rgb', level, type, ...ansiStyles.hexToRgb(...args));
  }
  return ansiStyles[type][model](...args);
};

const usedModels = ['rgb', 'hex', 'ansi256'];

for (const model of usedModels) {
  styles[model] = {
    get() {
      const { level } = this;
      return function (...args) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], 'color', ...args), ansiStyles.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };

  const bgModel = 'bg' + model.charAt(0).toUpperCase() + model.slice(1);
  styles[bgModel] = {
    get() {
      const { level } = this;
      return function (...args) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], 'bgColor', ...args), ansiStyles.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}

const proto = Object.defineProperties(() => {}, {
  ...styles,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level) {
      this[GENERATOR].level = level;
    }
  }
});

const createStyler = (open, close, parent) => {
  const openAll = parent ? parent.openAll + open : open;
  const closeAll = parent ? close + parent.closeAll : close;
  return { open, close, openAll, closeAll, parent };
};

const createBuilder = (self, _styler, _isEmpty) => {
  const builder = (...args) => applyStyle(builder, args.length === 1 ? '' + args[0] : args.join(' '));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};

const applyStyle = (self, string) => {
  if (self.level <= 0 || !string) {
    return self[IS_EMPTY] ? '' : string;
  }
  let styler = self[STYLER];
  if (styler === undefined) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes('\u001B')) {
    while (styler !== undefined) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf('\n');
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};

Object.defineProperties(createChalk.prototype, styles);

const chalk = createChalk();
export const chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });

export {
  modifierNames,
  foregroundColorNames,
  backgroundColorNames,
  colorNames,
  modifierNames as modifiers,
  foregroundColorNames as foregroundColors,
  backgroundColorNames as backgroundColors,
  colorNames as colors,
} from './vendor/ansi-styles/index.js';

export {
  stdoutColor as supportsColor,
  stderrColor as supportsColorStderr,
};

export default chalk;
