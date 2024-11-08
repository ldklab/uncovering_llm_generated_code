// jackspeak.js

export function jack(options = {}) {
  const config = {
    allowPositionals: options.allowPositionals ?? true,
    envPrefix: options.envPrefix,
    env: options.env ?? process.env,
    usage: options.usage ?? '',
    stopAtPositional: options.stopAtPositional ?? false,
    stopAtPositionalTest: options.stopAtPositionalTest ?? (() => false),
    fields: {},
  };

  const usages = [];

  function addField(type, multiple, fields) {
    for (const [name, details] of Object.entries(fields)) {
      config.fields[name] = { type, multiple, ...details };
    }
    return jackInstance;
  }

  function parse(args = process.argv.slice(2)) {
    const positionals = [];
    const values = {};

    let parsingPositionals = false;
    for (const arg of args) {
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
    }

    applyDefaults(values);
    writeToEnv(values);
    return { positionals, values };
  }

  function handleLongOption(arg, values) {
    const [name, rawValue] = arg.split('=');
    const field = config.fields[name] || config.fields[`no-${name}`];

    if (!field) {
      throw new Error(`Unrecognized option: --${name}`);
    }
    if (field.type === 'boolean' && !rawValue) {
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
      if (!field) {
        throw new Error(`Unrecognized short option: -${short}`);
      }
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
      default: // string
        return rawValue;
    }
  }

  function applyDefaults(values) {
    for (const [name, field] of Object.entries(config.fields)) {
      if (!(name in values) && field.default !== undefined) {
        values[name] = field.default;
      }
    }
  }

  function writeToEnv(values) {
    if (!config.envPrefix) return;
    for (const [name, value] of Object.entries(values)) {
      const envName = `${config.envPrefix}_${name.replace(/-/g, '_').toUpperCase()}`;
      config.env[envName] = Array.isArray(value) ? value.join(',') : String(value);
    }
  }

  function usage() {
    return usages.join('\n');
  }

  function description(text, options = {}) {
    usages.push(text.trim());
    return jackInstance;
  }

  function heading(text, level = 1) {
    usages.push(`\n${text}` + (level < 3 ? '\n' : ''));
    return jackInstance;
  }

  const jackInstance = {
    flag: (fields) => addField('boolean', false, fields),
    flagList: (fields) => addField('boolean', true, fields),
    num: (fields) => addField('number', false, fields),
    numList: (fields) => addField('number', true, fields),
    opt: (fields) => addField('string', false, fields),
    optList: (fields) => addField('string', true, fields),
    addFields: (fields) => addField(null, null, fields),
    parse,
    validate: (o) => {}, // Implement validation logic
    usage,
    heading,
    description,
    setConfigValues: (options, src) => {},
    usageMarkdown: () => '', // Implement usageMarkdown logic
  };

  return jackInstance;
}
