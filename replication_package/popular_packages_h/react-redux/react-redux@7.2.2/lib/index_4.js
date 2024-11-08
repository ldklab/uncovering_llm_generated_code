"use strict";

const { default: Provider } = require("./components/Provider");
const { default: connectAdvanced } = require("./components/connectAdvanced");
const { ReactReduxContext } = require("./components/Context");
const { default: connect } = require("./connect/connect");
const { useDispatch, createDispatchHook } = require("./hooks/useDispatch");
const { useSelector, createSelectorHook } = require("./hooks/useSelector");
const { useStore, createStoreHook } = require("./hooks/useStore");
const shallowEqual = require("./utils/shallowEqual").default;
const { unstable_batchedUpdates } = require("./utils/reactBatchedUpdates");
const { setBatch } = require("./utils/batch");

exports.Provider = Provider;
exports.connectAdvanced = connectAdvanced;
exports.ReactReduxContext = ReactReduxContext;
exports.connect = connect;
exports.useDispatch = useDispatch;
exports.createDispatchHook = createDispatchHook;
exports.useSelector = useSelector;
exports.createSelectorHook = createSelectorHook;
exports.useStore = useStore;
exports.createStoreHook = createStoreHook;
exports.shallowEqual = shallowEqual;
exports.batch = unstable_batchedUpdates;

setBatch(unstable_batchedUpdates);
