
export interface ProviderState {
  connection: any;
  chainId: number;
  account: string;
}

export interface TokensState {
  contracts: any;
  symbols: string[];
  balances: number[];
}

interface Swapping {
  isSwapping: boolean;
  isSuccess: boolean;
  transactionHash: string;
}
export interface DexAggregatorState {
  contract: any;
  swapping: Swapping;
}

interface Addresses {
  rump: { address: string };
  usd: { address: string };
  bloodMoonSwap: { address: string };
  cloudSwap: { address: string };
  dexAggregator: { address: string };
}

export interface Config {
  [key: number]: Addresses;
}

export interface RootState {
  provider: ProviderState;
  tokens: TokensState;
  dexAgg: DexAggregatorState;
}
