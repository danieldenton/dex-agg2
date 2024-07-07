export type Dispatch = (action: any) => void;

export type Provider = {
  getNetwork: () => Promise<{ chainId: number }>;
  getSigner: () => Promise<{ address: string }>;
  chainId: number;
};

export type DexAggregator = {
  address: string;
  swap(tokenGive: string, tokenGet: string, amount: number): Promise<any>;
};

export interface IERC20 {
  address: string;
  connect: (signer: { address: string }) => void;
  transfer: (recipient: string, amount: number) => Promise<boolean>;

  transferFrom: (
    sender: string,
    recipient: string,
    amount: number
  ) => Promise<boolean>;

  approve: (spender: string, amount: number) => Promise<boolean>;

  balanceOf: (account: string) => Promise<number>;
}
