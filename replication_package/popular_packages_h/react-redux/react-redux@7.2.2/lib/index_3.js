"use strict";

const { default: Provider } = require("./components/Provider");
const { default: connectAdvanced } = require("./components/connectAdvanced");
const { ReactReduxContext } = require("./components/Context");
const { default: connect } = require("./connect/connect");
const { useDispatch, createDispatchHook } = require("./hooks/useDispatch");
const { useSelector, createSelectorHook } = require("./hooks/useSelector");
const { useStore, createStoreHook } = require("./hooks/useStore");
const { unstable_batchedUpdates: batch } = require("./utils/reactBatchedUpdates");
const { default: shallowEqual } = require("./utils/shallowEqual");
const { setBatch } = require("./utils/batch");

setBatch(batch);

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
exports.batch = batch;
exports.shallowEqual = shallowEqual;
