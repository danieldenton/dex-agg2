const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const formatEther = (n) => {
  return ethers.utils.formatUnits(n, "ether");
};

describe("Dex Aggregator", () => {
  let dexAggregator,
    amm1,
    amm2,
    accounts,
    deployer,
    token1,
    token2,
    amount,
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
      .swapToken(token1.address, token2.address, investor1.address, tokens(1));
    await transaction.wait();

    const DEX_AGGREGATOR = await ethers.getContractFactory("DexAggregator");
    dexAggregator = await DEX_AGGREGATOR.deploy(amm1.address, amm2.address);

    // Calls to the AMM to check the dex agg
    amount = tokens(4);
    console.log(amount)
    amm2Token2ReturnAmount = await amm2.calculateTokenSwap(
      token1.address,
      token2.address,
      amount
    );
    amm1Token1ReturnAmount = await amm1.calculateTokenSwap(
      token2.address,
      token1.address,
      amount
    );
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
    it("finds the best amm for your token1 swap", async () => {
      const [chosenAMM, returnAmount] = await dexAggregator.ammSelector(
        token1.address,
        token2.address,
        amount
      );
      expect(chosenAMM).to.equal(amm2.address);
      expect(returnAmount).to.equal(amm2Token2ReturnAmount);
    });
    it("finds the best amm for your token2 swap", async () => {
      const [chosenAMM, returnAmount] = await dexAggregator.ammSelector(
        token2.address,
        token1.address,
        amount
      );
      expect(chosenAMM).to.equal(amm1.address);
      expect(returnAmount).to.equal(amm1Token1ReturnAmount);
    });
  });
  describe("Performs Swaps", () => {
    const formattedGiveAmount = formatEther(tokens(4));
    it("successfully swaps token1 for token2 ", async () => {
      const investor1Token1BalanceBeforeSwap = formatEther(
        await token1.balanceOf(investor1.address)
      );
      const investor1Token2BalanceBeforeSwap = formatEther(
        await token2.balanceOf(investor1.address)
      );
      const [chosenAMM] = await dexAggregator.ammSelector(
        token1.address,
        token2.address,
        amount
      );
      transaction = await token1.connect(investor1).approve(chosenAMM, amount);
      await transaction.wait();
      transaction = await dexAggregator
        .connect(investor1)
        .swap(token1.address, token2.address, amount);
      await transaction.wait();
      const investor1Token1BalanceAfterSwap = formatEther(
        await token1.balanceOf(investor1.address)
      );
      const investor1Token2BalanceAfterSwap = formatEther(
        await token2.balanceOf(investor1.address)
      );
      const tokenGetAmount = formatEther(amm2Token2ReturnAmount);
      expect(Number(investor1Token1BalanceAfterSwap)).to.equal(
        Number(investor1Token1BalanceBeforeSwap) - Number(formattedGiveAmount)
      );
      expect(Number(investor1Token2BalanceAfterSwap)).to.equal(
        Number(investor1Token2BalanceBeforeSwap) + Number(tokenGetAmount)
      );
    });
    it("successfully swaps token2 for token1 ", async () => {
      const investor2Token1BalanceBeforeSwap = formatEther(
        await token1.balanceOf(investor2.address)
      );
      const investor2Token2BalanceBeforeSwap = formatEther(
        await token2.balanceOf(investor2.address)
      );
      const [chosenAMM] = await dexAggregator.ammSelector(
        token2.address,
        token1.address,
        amount
      );
      transaction = await token2.connect(investor2).approve(chosenAMM, amount);
      await transaction.wait();
      transaction = await dexAggregator
        .connect(investor2)
        .swap(token2.address, token1.address, amount);
     await transaction.wait();
      const investor2Token1BalanceAfterSwap = formatEther(
        await token1.balanceOf(investor2.address)
      );
      const investor2Token2BalanceAfterSwap = formatEther(
        await token2.balanceOf(investor2.address)
      );
      const tokenGetAmount = formatEther(amm1Token1ReturnAmount);
      expect(Number(investor2Token2BalanceAfterSwap)).to.equal(
        Number(investor2Token2BalanceBeforeSwap) - Number(formattedGiveAmount)
      );
      expect(Number(investor2Token1BalanceAfterSwap)).to.equal(
        Number(investor2Token1BalanceBeforeSwap) + Number(tokenGetAmount)
      );
    });
  });
});
