"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAccount = exports.setNetwork = exports.setProvider = exports.provider = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
exports.provider = (0, toolkit_1.createSlice)({
    name: "provider",
    initialState: {
        connection: null,
        chainId: null,
        account: null,
    },
    reducers: {
        setProvider: function (state, action) {
            state.connection = action.payload;
        },
        setNetwork: function (state, action) {
            state.chainId = action.payload;
        },
        setAccount: function (state, action) {
            state.account = action.payload;
        },
    },
});
exports.setProvider = (_a = exports.provider.actions, _a.setProvider), exports.setNetwork = _a.setNetwork, exports.setAccount = _a.setAccount;
exports.default = exports.provider.reducer;
