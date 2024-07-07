"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapFail = exports.swapSuccess = exports.swapRequest = exports.setContract = exports.dexAgg = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
exports.dexAgg = (0, toolkit_1.createSlice)({
    name: "dexAgg",
    initialState: {
        contract: null,
        swapping: {
            isSwapping: false,
            isSuccess: false,
            transactionHash: null,
        },
    },
    reducers: {
        setContract: function (state, action) {
            state.contract = action.payload;
        },
        swapRequest: function (state) {
            state.swapping.isSwapping = true;
            state.swapping.isSuccess = false;
            state.swapping.transactionHash = null;
        },
        swapSuccess: function (state, action) {
            state.swapping.isSwapping = false;
            state.swapping.isSuccess = true;
            state.swapping.transactionHash = action.payload;
        },
        swapFail: function (state) {
            state.swapping.isSwapping = false;
            state.swapping.isSuccess = false;
            state.swapping.transactionHash = null;
        },
    },
});
exports.setContract = (_a = exports.dexAgg.actions, _a.setContract), exports.swapRequest = _a.swapRequest, exports.swapSuccess = _a.swapSuccess, exports.swapFail = _a.swapFail;
exports.default = exports.dexAgg.reducer;
