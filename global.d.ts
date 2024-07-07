interface Ethereum {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: (...args: any[]) => void) => void;
  }
  
  interface Window {
    ethereum: Ethereum;
  }

  declare module '../store/interactions' {
    export function loadAccount(): void; 
    export function loadBalances(): void;
    export function swap(): void;
  }
  