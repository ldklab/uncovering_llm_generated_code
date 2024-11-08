"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;

const Provider = _interopRequireDefault(require("./components/Provider")).default;
const connectAdvanced = _interopRequireDefault(require("./components/connectAdvanced")).default;
const { ReactReduxContext } = require("./components/Context");
const connect = _interopRequireDefault(require("./connect/connect")).default;

const { useDispatch, createDispatchHook } = require("./hooks/useDispatch");
const { useSelector, createSelectorHook } = require("./hooks/useSelector");
const { useStore, createStoreHook } = require("./hooks/useStore");

const { setBatch } = require("./utils/batch");
const { unstable_batchedUpdates: batch } = require("./utils/reactBatchedUpdates");
const shallowEqual = _interopRequireDefault(require("./utils/shallowEqual")).default;

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

setBatch(batch);
