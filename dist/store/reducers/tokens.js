"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.balancesLoaded = exports.setSymbols = exports.setContracts = exports.tokens = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
exports.tokens = (0, toolkit_1.createSlice)({
    name: "tokens",
    initialState: {
        contracts: [],
        symbols: [],
        balances: [0, 0],
    },
    reducers: {
        setContracts: function (state, action) {
            state.contracts = action.payload;
        },
        setSymbols: function (state, action) {
            state.symbols = action.payload;
        },
        balancesLoaded: function (state, action) {
            state.balances = action.payload;
        },
    },
});
exports.setContracts = (_a = exports.tokens.actions, _a.setContracts), exports.setSymbols = _a.setSymbols, exports.balancesLoaded = _a.balancesLoaded;
exports.default = exports.tokens.reducer;
