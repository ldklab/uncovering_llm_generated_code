const defineProperty = Object.defineProperty;
const getPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !((desc = getPropertyDescriptor(from, key)) && !desc.enumerable)
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportModule(srcExports, { constructStack: () => constructStack });
module.exports = toCommonJS(srcExports);

// src/MiddlewareStack.ts
const getAllAliases = setName((name, aliases) => {
  const allAliases = [];
  if (name) allAliases.push(name);
  if (aliases) allAliases.push(...aliases);
  return allAliases;
}, "getAllAliases");

const getMiddlewareNameWithAliases = setName((name, aliases) => {
  return `${name || "anonymous"}${aliases && aliases.length ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
}, "getMiddlewareNameWithAliases");

const constructStack = setName(() => {
  let absoluteEntries = [];
  let relativeEntries = [];
  let identifyOnResolve = false;
  const entriesNameSet = new Set();

  const sort = setName((entries) => {
    return entries.sort((a, b) => 
      stepWeights[b.step] - stepWeights[a.step] || 
      priorityWeights[b.priority || "normal"] - priorityWeights[a.priority || "normal"]
    );
  }, "sort");

  const removeByName = setName((toRemove) => {
    let isRemoved = false;
    const filterCb = setName((entry) => {
      const aliases = getAllAliases(entry.name, entry.aliases);
      if (aliases.includes(toRemove)) {
        isRemoved = true;
        aliases.forEach(alias => entriesNameSet.delete(alias));
        return false;
      }
      return true;
    }, "filterCb");

    absoluteEntries = absoluteEntries.filter(filterCb);
    relativeEntries = relativeEntries.filter(filterCb);
    return isRemoved;
  }, "removeByName");

  const removeByReference = setName((toRemove) => {
    let isRemoved = false;
    const filterCb = setName((entry) => {
      if (entry.middleware === toRemove) {
        isRemoved = true;
        getAllAliases(entry.name, entry.aliases).forEach(alias => entriesNameSet.delete(alias));
        return false;
      }
      return true;
    }, "filterCb");

    absoluteEntries = absoluteEntries.filter(filterCb);
    relativeEntries = relativeEntries.filter(filterCb);
    return isRemoved;
  }, "removeByReference");

  const cloneTo = setName((toStack) => {
    absoluteEntries.forEach(entry => toStack.add(entry.middleware, { ...entry }));
    relativeEntries.forEach(entry => toStack.addRelativeTo(entry.middleware, { ...entry }));
    if (toStack.identifyOnResolve) toStack.identifyOnResolve(stack.identifyOnResolve());
    return toStack;
  }, "cloneTo");

  const expandRelativeMiddlewareList = setName((from) => {
    const expandedList = [];
    from.before.forEach(entry => {
      if (!entry.before.length && !entry.after.length) {
        expandedList.push(entry);
      } else {
        expandedList.push(...expandRelativeMiddlewareList(entry));
      }
    });
    expandedList.push(from);
    from.after.reverse().forEach(entry => {
      if (!entry.before.length && !entry.after.length) {
        expandedList.push(entry);
      } else {
        expandedList.push(...expandRelativeMiddlewareList(entry));
      }
    });
    return expandedList;
  }, "expandRelativeMiddlewareList");

  const getMiddlewareList = setName((debug = false) => {
    const normalizedAbsoluteEntries = [];
    const normalizedRelativeEntries = [];
    const normalizedEntriesNameMap = {};

    absoluteEntries.forEach(entry => {
      const normalizedEntry = { ...entry, before: [], after: [] };
      getAllAliases(normalizedEntry.name, normalizedEntry.aliases).forEach(alias => {
        normalizedEntriesNameMap[alias] = normalizedEntry;
      });
      normalizedAbsoluteEntries.push(normalizedEntry);
    });

    relativeEntries.forEach(entry => {
      const normalizedEntry = { ...entry, before: [], after: [] };
      getAllAliases(normalizedEntry.name, normalizedEntry.aliases).forEach(alias => {
        normalizedEntriesNameMap[alias] = normalizedEntry;
      });
      normalizedRelativeEntries.push(normalizedEntry);
    });

    normalizedRelativeEntries.forEach(entry => {
      if (entry.toMiddleware) {
        const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
        if (!toMiddleware) {
          if (debug) return;
          throw new Error(
            `${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`
          );
        }
        if (entry.relation === "after") toMiddleware.after.push(entry);
        if (entry.relation === "before") toMiddleware.before.push(entry);
      }
    });

    return sort(normalizedAbsoluteEntries)
      .map(expandRelativeMiddlewareList)
      .reduce((wholeList, expandedList) => wholeList.concat(expandedList), []);
  }, "getMiddlewareList");

  const stack = {
    add: (middleware, options = {}) => {
      const { name, override, aliases } = options;
      const entry = { step: "initialize", priority: "normal", middleware, ...options };
      const entryAliases = getAllAliases(name, aliases);

      if (entryAliases.some(alias => entriesNameSet.has(alias))) {
        if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, aliases)}'`);
        entryAliases.forEach(alias => {
          const toOverrideIndex = absoluteEntries.findIndex(entry2 => 
            entry2.name === alias || entry2.aliases?.includes(alias)
          );
          if (toOverrideIndex !== -1) {
            const toOverride = absoluteEntries[toOverrideIndex];
            if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) {
              throw new Error(
                `"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`
              );
            }
            absoluteEntries.splice(toOverrideIndex, 1);
          }
        });
      }

      entryAliases.forEach(alias => entriesNameSet.add(alias));
      absoluteEntries.push(entry);
    },

    addRelativeTo: (middleware, options) => {
      const { name, override, aliases } = options;
      const entry = { middleware, ...options };
      const entryAliases = getAllAliases(name, aliases);

      if (entryAliases.some(alias => entriesNameSet.has(alias))) {
        if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, aliases)}'`);
        entryAliases.forEach(alias => {
          const toOverrideIndex = relativeEntries.findIndex(entry2 => 
            entry2.name === alias || entry2.aliases?.includes(alias)
          );
          if (toOverrideIndex !== -1) {
            const toOverride = relativeEntries[toOverrideIndex];
            if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) {
              throw new Error(
                `"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`
              );
            }
            relativeEntries.splice(toOverrideIndex, 1);
          }
        });
      }

      entryAliases.forEach(alias => entriesNameSet.add(alias));
      relativeEntries.push(entry);
    },

    clone: () => cloneTo(constructStack()),

    use: (plugin) => {
      plugin.applyToStack(stack);
    },

    remove: (toRemove) => {
      if (typeof toRemove === "string") return removeByName(toRemove);
      return removeByReference(toRemove);
    },

    removeByTag: (tag) => {
      let isRemoved = false;
      const filterCb = setName((entry) => {
        if (entry.tags?.includes(tag)) {
          getAllAliases(entry.name, entry.aliases).forEach(alias => entriesNameSet.delete(alias));
          isRemoved = true;
          return false;
        }
        return true;
      }, "filterCb");

      absoluteEntries = absoluteEntries.filter(filterCb);
      relativeEntries = relativeEntries.filter(filterCb);
      return isRemoved;
    },

    concat: (from) => {
      const cloned = cloneTo(constructStack());
      cloned.use(from);
      cloned.identifyOnResolve(
        identifyOnResolve || cloned.identifyOnResolve() || from.identifyOnResolve?.call(from) || false
      );
      return cloned;
    },

    applyToStack: cloneTo,

    identify: () => {
      return getMiddlewareList(true).map(mw => {
        const step = mw.step ?? `${mw.relation} ${mw.toMiddleware}`;
        return `${getMiddlewareNameWithAliases(mw.name, mw.aliases)} - ${step}`;
      });
    },

    identifyOnResolve: (toggle) => {
      if (typeof toggle === "boolean") identifyOnResolve = toggle;
      return identifyOnResolve;
    },

    resolve: (handler, context) => {
      getMiddlewareList().map(entry => entry.middleware).reverse().forEach(middleware => {
        handler = middleware(handler, context);
      });
      if (identifyOnResolve) console.log(stack.identify());
      return handler;
    }
  };

  return stack;
}, "constructStack");

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

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = { constructStack });
