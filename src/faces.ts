export interface StampInterface {
  height: number,
  timestamp: number,
  asset: string;
  address: string;
  vouched: boolean;
  vpst: {
    [address: string]: number;
  };
  super?: boolean;
  flagged: boolean;
}

export interface StateInterface {
  ticker: string;
  creator: string;
  supply: number;
  balances: {
    [addr: string]: number;
  };
  invocations: Array<string>;
  emergencyHaltWallet: string;
  halted: false;
  pairs: Array<any>;
  stamps: {
    [address_asset: string]: StampInterface
  };
  credits: {
    [height: string]: {
      holder: string,
      qty: number,
      asset: string
    }
  };
  canEvolve: boolean;
}

export interface BalanceInterface {
  target: string;
  balance: number;
  ticker: string;
}

export interface ActionInterface {
  input: InputInterface;
  caller: string;
}

export interface InputInterface {
  function:
  | "reward"
  | "stamp"
  | "transfer"
  | "balance"
  | "readOutbox"
  | "addPair"
  | "cancelOrder"
  | "createOrder"
  | "halt";
  target?: string;
  qty?: number;
  contract?: string;
  timestamp: number;
}

export interface ForeignCallInterface {
  txID: string;
  contract: string;
  input: any;
}

export interface AddPairInterface {
  function: "addPair";
  pair: [string, string]; // Pair that the user wants to initialize
}

export interface CreateOrderInterface {
  function: "createOrder";
  transaction: string; // Transaction hash from the token transfer to this contract
  pair: [string, string]; // Pair that user is trading between
  price?: number; // Price of token being sent (optional)
}

export interface CancelOrderInterface {
  function: "cancelOrder";
  orderID: string; // Transaction hash from the order creation contract interaction
}

export interface HaltInterface {
  function: "halt";
}

export interface ReadOutboxInterface {
  function: "readOutbox";
  contract: string;
  id: string;
}
