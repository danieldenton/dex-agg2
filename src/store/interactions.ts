import { ethers, BigNumber } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { setProvider, setNetwork, setAccount } from "./reducers/provider";
import { setContracts, setSymbols, balancesLoaded } from "./reducers/tokens";
import {
  setContract,
  swapRequest,
  swapSuccess,
  swapFail,
  withdrawRequest,
  withdrawSuccess,
  withdrawFail,
} from "./reducers/dexAggregator";
import DEX_AGGREGATOR_ABI from "../abis/DexAggregator.json";
import TOKEN_ABI from "../abis/Token.json";
import { Config } from "../types/state";
import { Dispatch, DexAgg, Provider, IERC20 } from "../types/interactionTypes";
import localhostData from "../localhostConfig.json";
import sepoliaData from "../seploiaConfig.json"
let config: Config;

export const loadProvider = (dispatch: Dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  dispatch(setProvider(provider));
  return provider;
};
export const loadNetwork = async (
  provider: Web3Provider,
  dispatch: Dispatch
) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setNetwork(chainId));
  return chainId;
};

export const loadAccount = async (dispatch: Dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch(setAccount(account));
  return account;
};

export const loadTokens = async (
  provider: Web3Provider,
  chainId: number,
  dispatch: Dispatch
) => {
  config = chainId === 11155111 ? sepoliaData : localhostData;
  console.log(config[chainId].rump.address)
  const rump = new ethers.Contract(
    config[chainId].rump.address,
    TOKEN_ABI,
    provider
  );
  const usd = new ethers.Contract(
    config[chainId].usd.address,
    TOKEN_ABI,
    provider
  );
  dispatch(setContracts([rump, usd]));
  dispatch(setSymbols([await rump.symbol(), await usd.symbol()]));
};

export const loadDexAgg = async (
  provider: any,
  chainId: number,
  dispatch: Dispatch
) => {
  config = chainId === 11155111 ? sepoliaData : localhostData;
  const dexAgg = new ethers.Contract(
    config[chainId].dexAggregator.address,
    DEX_AGGREGATOR_ABI,
    provider
  );
  dispatch(setContract(dexAgg));
  return dexAgg;
};

export const loadBalances = async (
  tokens: IERC20[],
  account: string,
  dispatch: Dispatch
) => {
  const balance1 = await tokens[0].balanceOf(account);
  const balance2 = await tokens[1].balanceOf(account);
  dispatch(
    balancesLoaded([
      ethers.utils.formatUnits(balance1.toString(), "ether"),
      ethers.utils.formatUnits(balance2.toString(), "ether"),
    ])
  );
};

export const swap = async (
  provider: Provider,
  dexAgg: DexAgg,
  tokenGive: IERC20,
  tokenGet: IERC20,
  amount: BigNumber,
  dispatch: Dispatch
) => {
  try {
    dispatch(swapRequest());
    let transaction: any;
    const signer = await provider.getSigner();

    transaction = await tokenGive
      .connect(signer)
      .approve(dexAgg.address, amount);
    await transaction.wait();

    transaction = await dexAgg
      .connect(signer)
      .swap(tokenGive.address, tokenGet.address, amount);

    await transaction.wait();

    dispatch(swapSuccess(transaction.hash));
  } catch (error) {
    dispatch(swapFail());
  }
};

export const withdraw = async (
  provider: Provider,
  dexAgg: DexAgg,
  token: string,
  dispatch: Dispatch
) => {
  try {
    dispatch(withdrawRequest());
    let transaction: any;
    const signer = await provider.getSigner();

    transaction = await dexAgg.connect(signer).withdrawTokenBalance(token);
    await transaction.wait();

    dispatch(withdrawSuccess(transaction.hash));
  } catch (error) {
    dispatch(withdrawFail());
  }
};
