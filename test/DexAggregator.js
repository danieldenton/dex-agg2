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

    let transaction = await token1
      .connect(deployer)
      .transfer(liquidityProvider.address, tokens(100000));
    await transaction.wait();
    transaction = await token2
      .connect(deployer)
      .transfer(liquidityProvider.address, tokens(100000));
    await transaction.wait();
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
      console.log(dexAggregator.address);
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
});
