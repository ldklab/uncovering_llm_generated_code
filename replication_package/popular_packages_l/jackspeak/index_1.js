// jackspeak.js

export function jack(options = {}) {
  const config = initializeConfig(options);
  const usages = [];

  const jackInstance = {
    flag: (fields) => addField('boolean', false, fields),
    flagList: (fields) => addField('boolean', true, fields),
    num: (fields) => addField('number', false, fields),
    numList: (fields) => addField('number', true, fields),
    opt: (fields) => addField('string', false, fields),
    optList: (fields) => addField('string', true, fields),
    addFields: (fields) => addField(null, null, fields),
    parse,
    validate: () => {}, 
    usage,
    heading,
    description,
    setConfigValues: () => {},
    usageMarkdown: () => ''
  };

  function initializeConfig(options) {
    return {
      allowPositionals: options.allowPositionals ?? true,
      envPrefix: options.envPrefix,
      env: options.env ?? process.env,
      usage: options.usage ?? '',
      stopAtPositional: options.stopAtPositional ?? false,
      stopAtPositionalTest: options.stopAtPositionalTest ?? (() => false),
      fields: {}
    };
  }

  function addField(type, multiple, fields) {
    Object.entries(fields).forEach(([name, details]) => {
      config.fields[name] = { type, multiple, ...details };
    });
    return jackInstance;
  }

  function parse(args = process.argv.slice(2)) {
    const positionals = [];
    const values = parseArgs(args);
    applyDefaults(values);
    writeToEnv(values);
    return { positionals, values };
  }

  function parseArgs(args) {
    const values = {};
    let parsingPositionals = false;

    args.forEach(arg => {
      if (!parsingPositionals && arg.startsWith('--')) {
        handleLongOption(arg.slice(2), values);
      } else if (!parsingPositionals && arg.startsWith('-')) {
        handleShortOptions(arg.slice(1), values);
      } else {
        if (!parsingPositionals && (config.stopAtPositional || config.stopAtPositionalTest(arg))) {
          parsingPositionals = true;
        }
        positionals.push(arg);
      }
    });

    return values;
  }

  function handleLongOption(arg, values) {
    const [name, rawValue] = arg.split('=');
    const field = config.fields[name] || config.fields[`no-${name}`];

    if (!field) throw new Error(`Unrecognized option: --${name}`);

    if (field.type === 'boolean' && rawValue === undefined) {
      values[name] = !name.startsWith('no-');
    } else {
      values[name] = parseValue(rawValue, field);
    }
  }

  function handleShortOptions(arg, values) {
    let remainingArg = arg;

    while (remainingArg) {
      const short = remainingArg[0];
      remainingArg = remainingArg.slice(1);

      const field = Object.values(config.fields).find(f => f.short === short);
      if (!field) throw new Error(`Unrecognized short option: -${short}`);

      if (field.type === 'boolean') {
        values[field.name] = !field.name.startsWith('no-');
      } else {
        const [rawValue, rest] = remainingArg.split('=', 2);
        values[field.name] = parseValue(rawValue, field);
        remainingArg = rest;
      }
    }
  }

  function parseValue(rawValue, field) {
    switch (field.type) {
      case 'number':
        return parseFloat(rawValue);
      case 'boolean':
        return rawValue === '1';
      default:
        return rawValue;
    }
  }

  function applyDefaults(values) {
    Object.entries(config.fields).forEach(([name, field]) => {
      if (!(name in values) && field.default !== undefined) {
        values[name] = field.default;
      }
    });
  }

  function writeToEnv(values) {
    if (!config.envPrefix) return;

    Object.entries(values).forEach(([name, value]) => {
      const envName = `${config.envPrefix}_${name.replace(/-/g, '_').toUpperCase()}`;
      config.env[envName] = Array.isArray(value) ? value.join(',') : String(value);
    });
  }

  function usage() {
    return usages.join('\n');
  }

  function description(text) {
    usages.push(text.trim());
    return jackInstance;
  }

  function heading(text, level = 1) {
    usages.push(`\n${text}` + (level < 3 ? '\n' : ''));
    return jackInstance;
  }

  return jackInstance;
}
