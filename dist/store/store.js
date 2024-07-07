"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var provider_1 = __importDefault(require("./reducers/provider"));
var tokens_1 = __importDefault(require("./reducers/tokens"));
var dexAggregator_1 = __importDefault(require("./reducers/dexAggregator"));
exports.store = (0, toolkit_1.configureStore)({
    reducer: {
        provider: provider_1.default,
        tokens: tokens_1.default,
        dexAgg: dexAggregator_1.default
    },
    middleware: function (getDefaultMiddleware) {
        return getDefaultMiddleware({
            serializableCheck: false,
        });
    },
});
