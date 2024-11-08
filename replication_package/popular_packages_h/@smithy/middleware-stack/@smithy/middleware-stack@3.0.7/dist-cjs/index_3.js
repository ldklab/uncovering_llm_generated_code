const defineProp = Object.defineProperty;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

const nameMiddleware = (target, value) => defineProp(target, "name", { value, configurable: true });

const exportModule = (target, exports) => {
  for (const name in exports) {
    defineProp(target, name, { get: exports[name], enumerable: true });
  }
};

const copyProps = (to, from, except) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropNames(from)) {
      if (!hasOwnProp.call(to, key) && key !== except) {
        defineProp(to, key, { get: () => from[key], enumerable: !getOwnPropDesc(from, key)?.enumerable });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProps(defineProp({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportModule(srcExports, { constructStack: () => constructStack });
module.exports = toCommonJS(srcExports);

// src/MiddlewareStack.ts
const getAllAliases = nameMiddleware((name, aliases) => {
  return name ? [name, ...(aliases || [])] : [];
}, "getAllAliases");

const getMiddlewareNameWithAliases = nameMiddleware((name, aliases) => {
  return `${name || "anonymous"}${aliases?.length ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
}, "getMiddlewareNameWithAliases");

const constructStack = nameMiddleware(() => {
  let absoluteEntries = [];
  let relativeEntries = [];
  let identifyOnResolve = false;
  const entriesNameSet = new Set();

  const stepWeights = { initialize: 5, serialize: 4, build: 3, finalizeRequest: 2, deserialize: 1 };
  const priorityWeights = { high: 3, normal: 2, low: 1 };

  const sort = nameMiddleware((entries) => {
    return entries.sort((a, b) => 
      stepWeights[b.step] - stepWeights[a.step] || priorityWeights[b.priority || "normal"] - priorityWeights[a.priority || "normal"]
    );
  }, "sort");

  const removeByName = nameMiddleware((toRemove) => {
    let isRemoved = false;
    const filterCb = nameMiddleware((entry) => {
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

  const removeByReference = nameMiddleware((toRemove) => {
    let isRemoved = false;
    const filterCb = nameMiddleware((entry) => {
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

  const cloneTo = nameMiddleware((toStack) => {
    absoluteEntries.forEach(entry => toStack.add(entry.middleware, { ...entry }));
    relativeEntries.forEach(entry => toStack.addRelativeTo(entry.middleware, { ...entry }));
    toStack.identifyOnResolve?.(stack.identifyOnResolve());
    return toStack;
  }, "cloneTo");

  const expandRelativeMiddlewareList = nameMiddleware((from) => {
    const expandedMiddlewareList = [];
    from.before.forEach((entry) => {
      expandedMiddlewareList.push(...(entry.before.length === 0 && entry.after.length === 0 ? [entry] : expandRelativeMiddlewareList(entry)));
    });
    expandedMiddlewareList.push(from);
    from.after.reverse().forEach((entry) => {
      expandedMiddlewareList.push(...(entry.before.length === 0 && entry.after.length === 0 ? [entry] : expandRelativeMiddlewareList(entry)));
    });
    return expandedMiddlewareList;
  }, "expandRelativeMiddlewareList");

  const getMiddlewareList = nameMiddleware((debug = false) => {
    const normalizedAbsoluteEntries = [];
    const normalizedRelativeEntries = [];
    const normalizedEntriesNameMap = {};

    absoluteEntries.forEach((entry) => {
      const normalizedEntry = { ...entry, before: [], after: [] };
      getAllAliases(normalizedEntry.name, normalizedEntry.aliases).forEach(alias => normalizedEntriesNameMap[alias] = normalizedEntry);
      normalizedAbsoluteEntries.push(normalizedEntry);
    });

    relativeEntries.forEach((entry) => {
      const normalizedEntry = { ...entry, before: [], after: [] };
      getAllAliases(normalizedEntry.name, normalizedEntry.aliases).forEach(alias => normalizedEntriesNameMap[alias] = normalizedEntry);
      normalizedRelativeEntries.push(normalizedEntry);
    });

    normalizedRelativeEntries.forEach((entry) => {
      const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
      if (!toMiddleware) {
        if (debug) return;
        throw new Error(`${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
      }
      (entry.relation === "after" ? toMiddleware.after : toMiddleware.before).push(entry);
    });

    return sort(normalizedAbsoluteEntries).flatMap(expandRelativeMiddlewareList);
  }, "getMiddlewareList");

  const stack = {
    add: (middleware, { name, override, aliases } = {}) => {
      const entry = { step: "initialize", priority: "normal", middleware, ...arguments[1] };
      const aliasList = getAllAliases(name, aliases);

      if (aliasList.some(alias => entriesNameSet.has(alias))) {
        if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, aliases)}'`);
        aliasList.forEach(alias => {
          const index = absoluteEntries.findIndex(e => e.name === alias || e.aliases?.includes(alias));
          if (index !== -1) {
            const toOverride = absoluteEntries[index];
            if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) {
              throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`);
            }
            absoluteEntries.splice(index, 1);
          }
        });
      }

      aliasList.forEach(alias => entriesNameSet.add(alias));
      absoluteEntries.push(entry);
    },
    addRelativeTo: (middleware, { name, override, aliases, toMiddleware, relation } = {}) => {
      const entry = { middleware, ...arguments[1] };
      const aliasList = getAllAliases(name, aliases);

      if (aliasList.some(alias => entriesNameSet.has(alias))) {
        if (!override) throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, aliases)}'`);
        aliasList.forEach(alias => {
          const index = relativeEntries.findIndex(e => e.name === alias || e.aliases?.includes(alias));
          if (index !== -1) {
            const toOverride = relativeEntries[index];
            if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) {
              throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`);
            }
            relativeEntries.splice(index, 1);
          }
        });
      }

      aliasList.forEach(alias => entriesNameSet.add(alias));
      relativeEntries.push(entry);
    },
    clone: () => cloneTo(constructStack()),
    use: (plugin) => plugin.applyToStack(stack),
    remove: (toRemove) => typeof toRemove === "string" ? removeByName(toRemove) : removeByReference(toRemove),
    removeByTag: (tag) => {
      let isRemoved = false;
      const filterCb = nameMiddleware((entry) => {
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
      cloned.identifyOnResolve(identifyOnResolve || cloned.identifyOnResolve() || from.identifyOnResolve?.());
      return cloned;
    },
    applyToStack: cloneTo,
    identify: () => getMiddlewareList(true).map(mw => `${getMiddlewareNameWithAliases(mw.name, mw.aliases)} - ${mw.step ?? `${mw.relation} ${mw.toMiddleware}`}`),
    identifyOnResolve: (toggle) => typeof toggle === "boolean" ? (identifyOnResolve = toggle) : identifyOnResolve,
    resolve: (handler, context) => {
      getMiddlewareList().map(entry => entry.middleware).reverse().forEach(middleware => handler = middleware(handler, context));
      if (identifyOnResolve) {
        console.log(stack.identify());
      }
      return handler;
    }
  };

  return stack;
}, "constructStack");
