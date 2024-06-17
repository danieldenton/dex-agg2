const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

const shares = ether;

describe("Dex Aggregator", () => {
  let dexAggregator,
    amm1,
    amm2,
    accounts,
    deployer,
    token1,
    token2,
    liquidityProvider,
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

    // create a swap on AMM1
    transaction = await token1
      .connect(investor1)
      .approve(amm1.address, tokens(100000));
    await transaction.wait();
    transaction = await amm1.connect(investor1).swapToken1(tokens(1));
      await transaction.wait();

    const DEX_AGGREGATOR = await ethers.getContractFactory("DexAggregator");
    dexAggregator = await DEX_AGGREGATOR.deploy(
      token1.address,
      token2.address,
      amm1.address,
      amm2.address
    );
  });
  describe("Deployment", () => {
    it("has an address", async () => {
      // console.log(dexAggregator.address);
      // Ask about this test.
      expect(dexAggregator.address).to.not.equal(0x0);
    });
    it("returns token1", async () => {
      expect(await dexAggregator.token1()).to.equal(token1.address);
    });
    it("returns token2", async () => {
      expect(await dexAggregator.token2()).to.equal(token2.address);
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
        amount = tokens(1)
        amm2token1cost = await amm2.calculateToken2Swap(amount)
        amm1token2cost = await amm1.calculateToken1Swap(amount);
        amm1token1cost = await amm1.calculateToken2Swap(amount)
        amm2token2cost = await amm2.calculateToken1Swap(amount);
    })
    it("finds the lowest cost between amm1 and amm2 for token1", async () => {
        expect(await dexAggregator.connect(investor2).getLowestToken1Cost(amount)).to.equal(amm2token1cost)
    })
    it("finds the lowest cost between amm1 and amm2 for token1", async () => {
        expect(await dexAggregator.connect(investor1).getLowestToken2Cost(amount)).to.equal(amm1token2cost)
    })
    it("is properly measuring values against each other", () => {
        expect(amm1token1cost).to.be.greaterThan(amm2token1cost)
        expect(amm2token2cost).to.be.greaterThan(amm1token2cost)
    })
  });
});
