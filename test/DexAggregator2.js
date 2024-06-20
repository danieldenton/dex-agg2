const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const formatEther = (n) => {
  return ethers.utils.formatUnits(n, "ether");
};

describe("Dex Aggregator2", () => {
  let dexAggregator,
  uniswapRouter,
  sushiswapRouter,
    accounts,
    swaper

  beforeEach(async () => {
    uniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    sushiswapRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
    accounts = await ethers.getSigners();
    deployer = accounts[0];

    swaper = accounts[1];


    const DEX_AGGREGATOR = await ethers.getContractFactory("DexAggregator2");
    dexAggregator = await DEX_AGGREGATOR.deploy(uniswapRouter, sushiswapRouter);

//     // first DEX_AGGREGATOR function call
//     amount = tokens(4);
//     amm2Token2ReturnAmount = await amm2.calculateTokenSwap(
//       token1.address,
//       token2.address,
//       amount
//     );
//     amm1Token1ReturnAmount = await amm1.calculateTokenSwap(
//       token2.address,
//       token1.address,
//       amount
//     );
  });
  describe("Deployment", () => {
    it("has an address", async () => {
      expect(dexAggregator.address).to.not.equal(0x0);
    });
    it("returns Uniswap", async () => {
      expect(await dexAggregator.uniswapRouter()).to.equal(uniswapRouter);
    });
    it("returns amm2", async () => {
      expect(await dexAggregator.sushiswapRouter()).to.equal(sushiswapRouter);
    });
  });
  describe("Finds the Best Price Between AMMs", () => {
    // it("finds the best amm for your token1 swap", async () => {
    //   const [chosenAMM, returnAmount] = await dexAggregator
    //     .connect(investor2)
    //     .ammSelector(token1.address, token2.address, amount);
    //   expect(chosenAMM).to.equal(amm2.address);
    //   expect(returnAmount).to.equal(amm2Token2ReturnAmount);
    // });
    // it("finds the best amm for your token2 swap", async () => {
    //   const [chosenAMM, returnAmount] = await dexAggregator
    //     .connect(investor2)
    //     .ammSelector(token2.address, token1.address, amount);
    //   expect(chosenAMM).to.equal(amm1.address);
    //   expect(returnAmount).to.equal(amm1Token1ReturnAmount);
    // });
  });
});
