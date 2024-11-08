const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype } = Object;
const { hasOwnProperty } = prototype;

const assignName = (target, value) => defineProperty(target, 'name', { value, configurable: true });

const exportAll = (target, items) => {
  for (let name in items) {
    defineProperty(target, name, { get: items[name], enumerable: true });
  }
};

const copyProperties = (to, from, except) => {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (let key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !getOwnPropertyDescriptor(from, key) || getOwnPropertyDescriptor(from, key).enumerable 
        });
      }
    }
  }
  return to;
};

const toCommonJS = (module) => copyProperties(defineProperty({}, '__esModule', { value: true }), module);

// Middleware stack construction
const createStack = () => {
  let absoluteEntries = [];
  let relativeEntries = [];
  let identifyOnResolve = false;
  const entriesSet = new Set();

  const sortEntries = (entries) => entries.sort(
    (a, b) => stepWeights[b.step] - stepWeights[a.step] || priorityWeights[b.priority || 'normal'] - priorityWeights[a.priority || 'normal']
  );

  const getAllAliases = (name, aliases) => {
    const result = [];
    if (name) result.push(name);
    if (aliases) result.push(...aliases);
    return result;
  };

  const getMiddlewareNameWithAliases = (name, aliases) => {
    return `${name || 'anonymous'}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
  };

  const removeEntryByName = (name) => {
    let wasRemoved = false;

    const filterCallback = (entry) => {
      const aliases = getAllAliases(entry.name, entry.aliases);
      if (aliases.includes(name)) {
        wasRemoved = true;
        aliases.forEach(alias => entriesSet.delete(alias));
        return false;
      }
      return true;
    };

    absoluteEntries = absoluteEntries.filter(filterCallback);
    relativeEntries = relativeEntries.filter(filterCallback);

    return wasRemoved;
  };

  const removeEntryByReference = (middleware) => {
    let wasRemoved = false;

    const filterCallback = (entry) => {
      if (entry.middleware === middleware) {
        wasRemoved = true;
        getAllAliases(entry.name, entry.aliases).forEach(alias => entriesSet.delete(alias));
        return false;
      }
      return true;
    };

    absoluteEntries = absoluteEntries.filter(filterCallback);
    relativeEntries = relativeEntries.filter(filterCallback);

    return wasRemoved;
  };

  const cloneInto = (targetStack) => {
    absoluteEntries.forEach(entry => targetStack.add(entry.middleware, { ...entry }));
    relativeEntries.forEach(entry => targetStack.addRelativeTo(entry.middleware, { ...entry }));
    if (targetStack.identifyOnResolve) targetStack.identifyOnResolve(stack.identifyOnResolve());
    return targetStack;
  };

  const expandMiddlewareList = (entry) => {
    const expandedList = [];
    
    // Process entries appearing before the current entry
    entry.before.forEach(beforeEntry => {
      if (!beforeEntry.before.length && !beforeEntry.after.length) {
        expandedList.push(beforeEntry);
      } else {
        expandedList.push(...expandMiddlewareList(beforeEntry));
      }
    });

    expandedList.push(entry);

    // Process entries appearing after the current entry
    entry.after.reverse().forEach(afterEntry => {
      if (!afterEntry.before.length && !afterEntry.after.length) {
        expandedList.push(afterEntry);
      } else {
        expandedList.push(...expandMiddlewareList(afterEntry));
      }
    });

    return expandedList;
  };

  const getMiddlewareList = (debug = false) => {
    const normalizedAbsoluteEntries = [];
    const normalizedRelativeEntries = [];
    const normalizedEntriesMap = {};

    absoluteEntries.forEach(entry => {
      const normalizedEntry = { ...entry, before: [], after: [] };
      getAllAliases(normalizedEntry.name, normalizedEntry.aliases).forEach(alias =>
        normalizedEntriesMap[alias] = normalizedEntry
      );
      normalizedAbsoluteEntries.push(normalizedEntry);
    });

    relativeEntries.forEach(entry => {
      const normalizedEntry = { ...entry, before: [], after: [] };
      getAllAliases(normalizedEntry.name, normalizedEntry.aliases).forEach(alias =>
        normalizedEntriesMap[alias] = normalizedEntry
      );
      normalizedRelativeEntries.push(normalizedEntry);
    });

    normalizedRelativeEntries.forEach(entry => {
      const toEntry = normalizedEntriesMap[entry.toMiddleware];
      if (!toEntry) {
        if (!debug) {
          throw new Error(`${entry.toMiddleware} not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
        }
        return;
      }
      if (entry.relation === 'after') toEntry.after.push(entry);
      if (entry.relation === 'before') toEntry.before.push(entry);
    });

    const sortedEntries = sortEntries(normalizedAbsoluteEntries);

    return sortedEntries
      .map(expandMiddlewareList)
      .reduce((result, expandedList) => {
        result.push(...expandedList);
        return result;
      }, []);
  };

  const stack = {
    add: (middleware, options = {}) => {
      const { name, override, aliases } = options;
      const entry = { step: 'initialize', priority: 'normal', middleware, ...options };
      const allAliases = getAllAliases(name, aliases);
      
      if (allAliases.some(alias => entriesSet.has(alias))) {
        if (!override) {
          throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, aliases)}'`);
        }
        allAliases.forEach(alias => {
          const index = absoluteEntries.findIndex(e => e.name === alias || e.aliases.includes(alias));
          if (index !== -1) {
            const toOverride = absoluteEntries[index];
            if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) {
              throw new Error(
                `"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`
              );
            }
            absoluteEntries.splice(index, 1);
          }
        });
      }

      allAliases.forEach(alias => entriesSet.add(alias));
      absoluteEntries.push(entry);
    },

    addRelativeTo: (middleware, options) => {
      const { name, override, aliases } = options;
      const entry = { middleware, ...options };
      const allAliases = getAllAliases(name, aliases);

      if (allAliases.some(alias => entriesSet.has(alias))) {
        if (!override) {
          throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, aliases)}'`);
        }
        allAliases.forEach(alias => {
          const index = relativeEntries.findIndex(e => e.name === alias || e.aliases.includes(alias));
          if (index !== -1) {
            const toOverride = relativeEntries[index];
            if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) {
              throw new Error(
                `"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`
              );
            }
            relativeEntries.splice(index, 1);
          }
        });
      }

      allAliases.forEach(alias => entriesSet.add(alias));
      relativeEntries.push(entry);
    },

    clone: () => cloneInto(createStack()),

    use: (plugin) => {
      plugin.applyToStack(stack);
    },

    remove: (removable) => {
      if (typeof removable === 'string') {
        return removeEntryByName(removable);
      } else {
        return removeEntryByReference(removable);
      }
    },

    removeByTag: (tag) => {
      let wasRemoved = false;

      const filterCallback = (entry) => {
        const { tags, name, aliases } = entry;
        if (tags && tags.includes(tag)) {
          getAllAliases(name, aliases).forEach(alias => entriesSet.delete(alias));
          wasRemoved = true;
          return false;
        }
        return true;
      };

      absoluteEntries = absoluteEntries.filter(filterCallback);
      relativeEntries = relativeEntries.filter(filterCallback);

      return wasRemoved;
    },

    concat: (otherStack) => {
      const mergedStack = cloneInto(createStack());
      mergedStack.use(otherStack);
      mergedStack.identifyOnResolve(otherStack.identifyOnResolve || identifyOnResolve);
      return mergedStack;
    },

    applyToStack: cloneInto,

    identify: () => getMiddlewareList(true).map(middleware => {
      const step = middleware.step ?? `${middleware.relation} ${middleware.toMiddleware}`;
      return `${getMiddlewareNameWithAliases(middleware.name, middleware.aliases)} - ${step}`;
    }),

    identifyOnResolve(toggle) {
      if (typeof toggle === 'boolean') identifyOnResolve = toggle;
      return identifyOnResolve;
    },

    resolve: (handler, context) => {
      getMiddlewareList()
        .map(entry => entry.middleware)
        .reverse()
        .forEach(middleware => {
          handler = middleware(handler, context);
        });

      if (identifyOnResolve) {
        console.log(stack.identify());
      }

      return handler;
    }
  };

  return stack;
};

// Weights for sorting middleware
const stepWeights = {
  initialize: 5,
  serialize: 4,
  build: 3,
  finalizeRequest: 2,
  deserialize: 1
};

const priorityWeights = {
  high: 3,
  normal: 2,
  low: 1
};

// Module export
const moduleExports = {};
exportAll(moduleExports, {
  createStack
});

module.exports = toCommonJS(moduleExports);
