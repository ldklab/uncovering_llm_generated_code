// Utility functions for managing properties and modules
const defineProp = (obj, key, val) => Object.defineProperty(obj, key, { value: val, configurable: true });
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

// Custom function naming
const nameFunction = (func, name) => defineProp(func, "name", name);

// Export functionality
const exportModule = (target, exports) => {
  for (const key in exports)
    defineProp(target, key, { get: exports[key], enumerable: true });
};

const copyProps = (to, from, except, desc) => {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    getOwnPropNames(from).forEach(key => {
      if (!hasOwnProp.call(to, key) && key !== except)
        defineProp(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropDesc(from, key)) || desc.enumerable });
    });
  }
  return to;
};

const toCommonJS = mod => copyProps(defineProp({}, "__esModule", { value: true }), mod);

// src/index.ts
const exports = {};
exportModule(exports, { constructStack: () => constructStack });
module.exports = toCommonJS(exports);

// src/MiddlewareStack.ts
const getAllAliases = (name, aliases) => {
  const allAliases = [];
  if (name) allAliases.push(name);
  if (aliases) allAliases.push(...aliases);
  return allAliases;
};
nameFunction(getAllAliases, "getAllAliases");

const getMiddlewareNameWithAliases = (name, aliases) => {
  return `${name || "anonymous"}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
};
nameFunction(getMiddlewareNameWithAliases, "getMiddlewareNameWithAliases");

const constructStack = () => {
  let absoluteEntries = [];
  let relativeEntries = [];
  let identifyOnResolve = false;
  const entriesNameSet = new Set();

  const sort = entries => entries.sort((a, b) => {
    return stepWeights[b.step] - stepWeights[a.step] ||
           priorityWeights[b.priority || "normal"] - priorityWeights[a.priority || "normal"];
  });
  nameFunction(sort, "sort");

  const removeByName = toRemove => {
    let isRemoved = false;
    const filterCb = entry => {
      const aliases = getAllAliases(entry.name, entry.aliases);
      if (aliases.includes(toRemove)) {
        isRemoved = true;
        aliases.forEach(alias => entriesNameSet.delete(alias));
        return false;
      }
      return true;
    };
    absoluteEntries = absoluteEntries.filter(filterCb);
    relativeEntries = relativeEntries.filter(filterCb);
    return isRemoved;
  };
  nameFunction(removeByName, "removeByName");

  const removeByReference = toRemove => {
    let isRemoved = false;
    const filterCb = entry => {
      if (entry.middleware === toRemove) {
        isRemoved = true;
        getAllAliases(entry.name, entry.aliases).forEach(alias => entriesNameSet.delete(alias));
        return false;
      }
      return true;
    };
    absoluteEntries = absoluteEntries.filter(filterCb);
    relativeEntries = relativeEntries.filter(filterCb);
    return isRemoved;
  };
  nameFunction(removeByReference, "removeByReference");

  const cloneTo = toStack => {
    absoluteEntries.forEach(entry => toStack.add(entry.middleware, { ...entry }));
    relativeEntries.forEach(entry => toStack.addRelativeTo(entry.middleware, { ...entry }));
    if (toStack.identifyOnResolve) toStack.identifyOnResolve(stack.identifyOnResolve());
    return toStack;
  };
  nameFunction(cloneTo, "cloneTo");

  const expandRelativeMiddlewareList = from => {
    const expandedMiddlewareList = [];
    from.before.forEach(entry => {
      if (entry.before.length === 0 && entry.after.length === 0) {
        expandedMiddlewareList.push(entry);
      } else {
        expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
      }
    });
    expandedMiddlewareList.push(from);
    from.after.reverse().forEach(entry => {
      if (entry.before.length === 0 && entry.after.length === 0) {
        expandedMiddlewareList.push(entry);
      } else {
        expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
      }
    });
    return expandedMiddlewareList;
  };
  nameFunction(expandRelativeMiddlewareList, "expandRelativeMiddlewareList");

  const getMiddlewareList = (debug = false) => {
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
          throw new Error(`${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
        }
        if (entry.relation === "after") {
          toMiddleware.after.push(entry);
        }
        if (entry.relation === "before") {
          toMiddleware.before.push(entry);
        }
      }
    });

    return sort(normalizedAbsoluteEntries).map(expandRelativeMiddlewareList).reduce((list, expanded) => [...list, ...expanded], []);
  };
  nameFunction(getMiddlewareList, "getMiddlewareList");

  const stack = {
    add: (middleware, options = {}) => {
      const { name, override, aliases: _aliases } = options;
      const entry = { step: "initialize", priority: "normal", middleware, ...options };
      const aliases = getAllAliases(name, _aliases);
      if (aliases.length > 0 && aliases.some(alias => entriesNameSet.has(alias))) {
        if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
        aliases.forEach(alias => {
          const idx = absoluteEntries.findIndex(e => e.name === alias || e.aliases?.includes(alias));
          if (idx !== -1) absoluteEntries.splice(idx, 1);
        });
      }
      aliases.forEach(alias => entriesNameSet.add(alias));
      absoluteEntries.push(entry);
    },
    addRelativeTo: (middleware, options) => {
      const { name, override, aliases: _aliases } = options;
      const entry = { middleware, ...options };
      const aliases = getAllAliases(name, _aliases);
      if (aliases.length > 0 && aliases.some(alias => entriesNameSet.has(alias))) {
        if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
        aliases.forEach(alias => {
          const idx = relativeEntries.findIndex(e => e.name === alias || e.aliases?.includes(alias));
          if (idx !== -1) relativeEntries.splice(idx, 1);
        });
      }
      aliases.forEach(alias => entriesNameSet.add(alias));
      relativeEntries.push(entry);
    },
    clone: () => cloneTo(constructStack()),
    use: plugin => plugin.applyToStack(stack),
    remove: toRemove => (typeof toRemove === "string") ? removeByName(toRemove) : removeByReference(toRemove),
    removeByTag: toRemove => {
      let isRemoved = false;
      const filterCb = entry => {
        if (entry.tags?.includes(toRemove)) {
          getAllAliases(entry.name, entry.aliases).forEach(alias => entriesNameSet.delete(alias));
          isRemoved = true;
          return false;
        }
        return true;
      };
      absoluteEntries = absoluteEntries.filter(filterCb);
      relativeEntries = relativeEntries.filter(filterCb);
      return isRemoved;
    },
    concat: from => {
      const cloned = cloneTo(constructStack());
      cloned.use(from);
      return cloned;
    },
    applyToStack: cloneTo,
    identify: () => getMiddlewareList(true).map(mw => `${getMiddlewareNameWithAliases(mw.name, mw.aliases)} - ${mw.step || mw.relation + " " + mw.toMiddleware}`),
    identifyOnResolve: toggle => typeof toggle === "boolean" ? (identifyOnResolve = toggle) : identifyOnResolve,
    resolve: (handler, context) => {
      getMiddlewareList().reverse().forEach(entry => { handler = entry.middleware(handler, context); });
      if (identifyOnResolve) console.log(stack.identify());
      return handler;
    }
  };

  return stack;
};
nameFunction(constructStack, "constructStack");

const stepWeights = { initialize: 5, serialize: 4, build: 3, finalizeRequest: 2, deserialize: 1 };
const priorityWeights = { high: 3, normal: 2, low: 1 };

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = { constructStack });
