import { BigNumber } from 'ethers';

export type Dispatch = (action: any) => void;

export type Provider = {
  getNetwork: () => Promise<{ chainId: number }>;
  getSigner: () => Promise<{ address: string }>;
 
};

interface DexAggConnect {
  swap(tokenGive: string, tokenGet: string, amount: BigNumber): Promise<any>;
  withdrawTokenBalance(token: string): Promise<boolean>;
}

export type DexAgg = {
  address: string;
  connect: (signer: { address: string }) => DexAggConnect;
};

interface IERC20Connect {
  approve: (spender: string, amount: BigNumber) => Promise<boolean>;
}

export interface IERC20 {
  address: string;
  connect: (signer: { address: string }) => IERC20Connect;
  balanceOf: (account: string) => Promise<number>;
}

