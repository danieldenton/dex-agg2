import { createSelector } from "reselect";

const tokens = (state) => state.tokens.contracts;
const swaps = (state) => state.amm.swaps;

export const chartSelector = createSelector(swaps, tokens, (swaps, tokens) => {
  if (!tokens[0] || !tokens[1]) {
    return;
  }

  swaps = swaps.filter(
    (s) =>
      s.args.tokenGet === tokens[0].address ||
      s.args.tokenGet === tokens[1].address
  );
  swaps = swaps.filter(
    (s) =>
      s.args.tokenGive === tokens[0].address ||
      s.args.tokenGive === tokens[1].address
  );

  const decorateSwap = (swap) => {
    let rate = swap.args.token2Balance / swap.args.token1Balance;
    rate = Math.round(rate * 100000) / 100000;
    return { ...swap, rate };
  };

  swaps = swaps.map((s) => decorateSwap(s));

  const prices = swaps.map((s) => s.rate);

  swaps = swaps.sort((a, b) => b.args.timestamp - a.args.timestamp);

  return {
    swaps: swaps,
    series: [
      {
        name: "Rate",
        data: prices,
      },
    ],
  };
});
