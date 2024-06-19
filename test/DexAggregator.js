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

    // first DEX_AGGREGATOR function call
    amount = tokens(4);
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
      const [chosenAMM, returnAmount] = await dexAggregator
        .connect(investor2)
        .ammSelector(token1.address, token2.address, amount);
      expect(chosenAMM).to.equal(amm2.address);
      expect(returnAmount).to.equal(amm2Token2ReturnAmount);
    });
    it("finds the best amm for your token2 swap", async () => {
      const [chosenAMM, returnAmount] = await dexAggregator
        .connect(investor2)
        .ammSelector(token2.address, token1.address, amount);
      expect(chosenAMM).to.equal(amm1.address);
      expect(returnAmount).to.equal(amm1Token1ReturnAmount);
    });
  });
  describe("Performs Swaps", () => {
    let investor1Token1BalanceBeforeSwap,
      investor1Token2BalanceBeforeSwap,
      investor1Token1BalanceAfterSwap,
      investor1Token2BalanceAfterSwap,
      formattedAmount,
      result;
    beforeEach(async () => {
      investor1Token1BalanceBeforeSwap = formatEther(
        await token1.balanceOf(investor1.address)
      );
      investor1Token2BalanceBeforeSwap = formatEther(
        await token2.balanceOf(investor1.address)
      );
      formattedAmount = formatEther(amount);
      transaction = await token1
        .connect(investor1)
        .approve(dexAggregator.address, amount);
      await transaction.wait();
      transaction = await dexAggregator
        .connect(investor1)
        .swap(token1.address, token2.address, amount);
      result = await transaction.wait();
      investor1Token1BalanceAfterSwap = formatEther(
        await token1.balanceOf(investor1.address)
      );
      investor1Token2BalanceAfterSwap = formatEther(
        await token2.balanceOf(investor1.address)
      );
    });
    it("emits an event", () => {
      const event = result.events[6];
      // console.log(event)
      expect(event.event).to.equal("Swap");

      const args = event.args;
      expect(args.from).to.equal(investor1.address);
      expect(args.to).to.equal(dexAggregator.address);
      expect(args.amm).to.equal(amm2.address);
      expect(args.tokenGive).to.equal(token1.address);
      expect(args.tokenGiveAmount).to.equal(amount);
      expect(args.tokenGet).to.equal(token2.address);
      expect(args.tokenGetAmount).to.equal(amm2Token2ReturnAmount);
    });
    it("successfully swaps token1 for token2 ", async () => {
      const tokenGetAmount = formatEther(result.events[6].args.tokenGetAmount);
      expect(Number(investor1Token1BalanceAfterSwap)).to.equal(
        Number(investor1Token1BalanceBeforeSwap) - Number(formattedAmount)
      );
      expect(Number(investor1Token2BalanceAfterSwap)).to.equal(
        Number(investor1Token2BalanceBeforeSwap) + Number(tokenGetAmount)
      );
    });
  });
});
