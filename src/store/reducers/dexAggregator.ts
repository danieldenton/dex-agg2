import { createSlice } from "@reduxjs/toolkit";

export const dexAgg = createSlice({
  name: "dexAgg",
  initialState: {
    contract: null,
    swapping: {
      isSwapping: false,
      isSuccess: false,
      transactionHash: null,
    },
    withdrawing: {
      isWithdrawing: false,
      isSuccess: false,
      transactionHash: null,
    },
  },

  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    swapRequest: (state) => {
      state.swapping.isSwapping = true;
      state.swapping.isSuccess = false;
      state.swapping.transactionHash = null;
    },
    swapSuccess: (state, action) => {
      state.swapping.isSwapping = false;
      state.swapping.isSuccess = true;
      state.swapping.transactionHash = action.payload;
    },
    swapFail: (state) => {
      state.swapping.isSwapping = false;
      state.swapping.isSuccess = false;
      state.swapping.transactionHash = null;
    },
    withdrawRequest: (state) => {
      state.withdrawing.isWithdrawing = true;
      state.withdrawing.isSuccess = false;
      state.withdrawing.transactionHash = null;
    },
    withdrawSuccess: (state, action) => {
      state.withdrawing.isWithdrawing = false;
      state.withdrawing.isSuccess = true;
      state.withdrawing.transactionHash = action.payload;
    },
    withdrawFail: (state) => {
      state.withdrawing.isWithdrawing = false;
      state.withdrawing.isSuccess = false;
      state.withdrawing.transactionHash = null;
    },
  },
});

export const {
  setContract,
  swapRequest,
  swapSuccess,
  swapFail,
  withdrawRequest,
  withdrawSuccess,
  withdrawFail,
} = dexAgg.actions;

export default dexAgg.reducer;
