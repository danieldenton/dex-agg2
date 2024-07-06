export interface ProviderState {
  chainId: number;
  account: string | null;
}

export interface TokensState {
  // Define tokens state properties
}

export interface DexAggregatorState {
  // Define dex aggregator state properties
}

interface Addresses {
  rump: { address: string };
  usd: { address: string };
  bloodMoonSwap: { address: string };
  cloudSwap: { address: string };
  dexAggregator: { address: string };
}

export interface Config {
  [key: number]: Addresses
}

export interface RootState {
  provider: ProviderState;
  tokens: TokensState;
  dexAggregator: DexAggregatorState;
}
