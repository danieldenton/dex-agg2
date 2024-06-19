const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Dex Aggregator", () => {
  let dexAggregator,
    amm1,
    amm2,
    accounts,
    deployer,
    token1,
    token2,
    investor1,
    investor2;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    liquidityProvider = accounts[1];
    investor1 = accounts[2];
    investor2 = accounts[3];

    const Token = await ethers.getContractFactory("Token");
    token1 = await Token.deploy("Rumpelina", "RUMP", "1000000");
    token2 = await Token.deploy("Darkness", "DRKN", "1000000");

    // transfer tokens to investors
    transaction = await token1
      .connect(deployer)
      .transfer(investor1.address, tokens(100000));
    await transaction.wait();
    transaction = await token2
      .connect(deployer)
      .transfer(investor2.address, tokens(100000));
    await transaction.wait();

    const AMM = await ethers.getContractFactory("AMM");
    amm1 = await AMM.deploy(token1.address, token2.address);
    amm2 = await AMM.deploy(token1.address, token2.address);

    // add liquidity
    amount = tokens(100000);
    // AMM1
    transaction = await token1.connect(deployer).approve(amm1.address, amount);
    await transaction.wait();
    transaction = await token2.connect(deployer).approve(amm1.address, amount);
    await transaction.wait();
    transaction = await amm1.connect(deployer).addLiquidity(amount, amount);
    await transaction.wait();
    // AMM2
    transaction = await token1.connect(deployer).approve(amm2.address, amount);
    await transaction.wait();
    transaction = await token2.connect(deployer).approve(amm2.address, amount);
    await transaction.wait();
    transaction = await amm2.connect(deployer).addLiquidity(amount, amount);
    await transaction.wait();

    // create a swap on AMM1 which will make token1 cheaper on AMM1
    transaction = await token1
      .connect(investor1)
      .approve(amm1.address, tokens(1));
    await transaction.wait();
    transaction = await amm1
      .connect(investor1)
      .swapToken(token1.address, token2.address, tokens(1));
    await transaction.wait();

    const DEX_AGGREGATOR = await ethers.getContractFactory("DexAggregator");
    dexAggregator = await DEX_AGGREGATOR.deploy(amm1.address, amm2.address);
  });
  describe("Deployment", () => {
    it("has an address", async () => {
      expect(dexAggregator.address).to.not.equal(0x0);
    });
    it("returns amm1", async () => {
      expect(await dexAggregator.amm1()).to.equal(amm1.address);
    });
    it("returns amm2", async () => {
      expect(await dexAggregator.amm2()).to.equal(amm2.address);
    });
  });
  describe("Finds the Best Price Between AMMs", () => {
    beforeEach(async () => {
      amount = tokens(1);
      amm2token1cost = await amm2.calculateTokenSwap(
        token2.address,
        token1.address,
        amount
      );
      amm1token2cost = await amm1.calculateTokenSwap(
        token1.address,
        token2.address,
        amount
      );
    });
    it("finds the best amm for your token1 swap", async () => {
      const [chosenAMM, cost] = await dexAggregator
        .connect(investor2)
        .ammSelector(token1.address, token2.address, amount);
      expect(chosenAMM).to.equal(amm1.address);
      expect(cost).to.equal(amm1token2cost);
    });
    it("finds the best amm for your token2 swap", async () => {
      const [chosenAMM, cost] = await dexAggregator
        .connect(investor2)
        .ammSelector(token2.address, token1.address, amount);
      expect(chosenAMM).to.equal(amm2.address);
      expect(cost).to.equal(amm2token1cost);
    });
  });
  describe("Performs Swaps", () => {
    amount = tokens(5);
    // beforeEach(async () => {
     
    //   const investor2Token2BalanceBeforeSwap = await token1.balanceOf(
    //     investor2.address
    //   );
    // });
    it("successfully swaps token1 for token2 ", async () => {
      const investor1Token1BalanceBeforeSwap = await token1.balanceOf(
        investor2.address
      );
      const investor1Token2BalanceBeforeSwap = await token2.balanceOf(
        investor1.address
      );
      transaction = await token1
        .connect(investor1)
        .approve(dexAggregator.address, amount);
      await transaction.wait();
      transaction = await dexAggregator
        .connect(investor1)
        .swap(token1.address, token2.address, amount);
      await transaction.wait();
      // const investor1Token1BalanceAfterSwap = await token1.balanceOf(
      //   investor1.address
      // );
      // const investor1Token2BalanceAfterSwap = await token1.balanceOf(
      //   investor1.address
      // );
      // expect(investor1Token1BalanceAfterSwap).to.equal(
      //   investor1Token1BalanceBeforeSwap - amount
      // );
      // expect(investor1Token2BalanceAfterSwap).to.equal(
      //   investor1Token2BalanceBeforeSwap + amount
      // );
    });
  });
});
