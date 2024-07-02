const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

const shares = ether;

describe("AMM", () => {
  let amm,
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
    token1 = await Token.deploy("Dapp University", "DAPP", "1000000");
    token2 = await Token.deploy("USD Token", "USD", "1000000");

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
    amm = await AMM.deploy(token1.address, token2.address);
  });

  describe("Deployment", () => {
    it("has an address", async () => {
      expect(amm.address).to.not.equal(0x0);
    });
    it("returns token1", async () => {
      expect(await amm.token1()).to.equal(token1.address);
    });
    it("returns token2", async () => {
      expect(await amm.token2()).to.equal(token2.address);
    });
  });
  describe("Receives Liquidity and Distributes Shares", () => {
    beforeEach(async () => {
      amount = tokens(100000);
      transaction = await token1.connect(deployer).approve(amm.address, amount);
      await transaction.wait();
      transaction = await token2.connect(deployer).approve(amm.address, amount);
      await transaction.wait();
      transaction = await amm.connect(deployer).addLiquidity(amount, amount);
      await transaction.wait();
    });
    it("receives liquidity", async () => {
      expect(await token1.balanceOf(amm.address)).to.equal(amount);
      expect(await token2.balanceOf(amm.address)).to.equal(amount);
      expect(await amm.token1Balance()).to.equal(amount);
      expect(await amm.token2Balance()).to.equal(amount);
      let k = amount.toBigInt() * amount.toBigInt();
      expect(await amm.K()).to.equal(k);
    });
    it("distibutes shares", async () => {
      expect(await amm.shares(deployer.address)).to.equal(tokens(100));
    });
    it("updates total shares", async () => {
      expect(await amm.totalShares()).to.equal(tokens(100));
    });
    it("calculates _token2 for deposit", async () => {
      amount = tokens(50000);
      transaction = await token1
        .connect(liquidityProvider)
        .approve(amm.address, amount);
      await transaction.wait();
      transaction = await token2
        .connect(liquidityProvider)
        .approve(amm.address, amount);
      await transaction.wait();

      let token2Deposit = await amm.calculateTokenDeposit(
        token1.address,
        amount,
        token2.address
      );
      transaction = await amm
        .connect(liquidityProvider)
        .addLiquidity(amount, token2Deposit);
      await transaction.wait();
      expect(await amm.shares(liquidityProvider.address)).to.equal(tokens(50));
      expect(await amm.shares(deployer.address)).to.equal(tokens(100));
      expect(await amm.totalShares()).to.equal(tokens(150));
    });
  });
  describe("Swaps tokens", () => {
    let estimate,
      fee,
      balanceOfInvestor1Token1BeforeSwap,
      balanceOfInvestor1Token2BeforeSwap;
    describe("Success", () => {
      beforeEach(async () => {
        amount = tokens(5000);
        transaction = await token1
          .connect(deployer)
          .approve(amm.address, amount);
        await transaction.wait();
        transaction = await token2
          .connect(deployer)
          .approve(amm.address, amount);
        await transaction.wait();
        transaction = await amm.connect(deployer).addLiquidity(amount, amount);
        await transaction.wait();
        amount = tokens(1);
        transaction = await token1
          .connect(investor1)
          .approve(amm.address, amount);
        await transaction.wait();

        balanceOfInvestor1Token1BeforeSwap = await token1.balanceOf(
          investor1.address
        );
        balanceOfInvestor1Token2BeforeSwap = await token2.balanceOf(
          investor1.address
        );

        [estimate, fee] = await amm.calculateTokenSwap(
          token1.address,
          token2.address,
          amount
        );

        transaction = await amm
          .connect(investor1)
          .swapToken(token1.address, token2.address, amount);
        await transaction.wait();
      });
      it("swaps tokens", async () => {
        const balanceOfInvestor1Token1AfterSwap = await token1.balanceOf(
          investor1.address
        );
        const balanceOfInvestor1Token2AfterSwap = await token2.balanceOf(
          investor1.address
        );
        expect(Number(balanceOfInvestor1Token1AfterSwap)).to.equal(
          Number(balanceOfInvestor1Token1BeforeSwap) - Number(amount)
        );
        expect(Number(balanceOfInvestor1Token2AfterSwap)).to.equal(
          Number(balanceOfInvestor1Token2BeforeSwap) + Number(estimate)
        );
      });
      it("emits a Swap event", async () => {
        await expect(transaction)
          .to.emit(amm, "Swap")
          .withArgs(
            investor1.address,
            token1.address,
            amount,
            token2.address,
            estimate,
            await amm.token1Balance(),
            await amm.token2Balance(),
            (
              await ethers.provider.getBlock(
                await ethers.provider.getBlockNumber()
              )
            ).timestamp
          );
      });
    });
    describe("Failure", () => {
      it("reverts an invalid liquidity pair", async () => {
        await expect(
          amm.calculateTokenSwap(token1.address, token2.address, amount)
        ).to.be.reverted;
        await expect(
          amm
            .connect(investor1)
            .swapToken(token1.address, token2.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Removes Liquidity and Updates Shares", () => {
    describe("Success", () => {
      beforeEach(async () => {
        amount = tokens(100000);
        transaction = await token1
          .connect(deployer)
          .approve(amm.address, amount);
        await transaction.wait();
        transaction = await token2
          .connect(deployer)
          .approve(amm.address, amount);
        await transaction.wait();
        transaction = await amm.connect(deployer).addLiquidity(amount, amount);
        await transaction.wait();
        amount = tokens(50000);
        transaction = await token1
          .connect(liquidityProvider)
          .approve(amm.address, amount);
        await transaction.wait();
        transaction = await token2
          .connect(liquidityProvider)
          .approve(amm.address, amount);
        await transaction.wait();
        transaction = await amm
          .connect(liquidityProvider)
          .addLiquidity(amount, amount);
        await transaction.wait();
        balanceToken1BeforeRemoval = await token1.balanceOf(
          liquidityProvider.address
        );
        balanceToken2BeforeRemoval = await token2.balanceOf(
          liquidityProvider.address
        );
        transaction = await amm
          .connect(liquidityProvider)
          .removeLiquidity(shares(50));
        await transaction.wait();
      });
      it("removes liquididty", async () => {
        balanceToken1After = await token1.balanceOf(liquidityProvider.address);
        balanceToken2After = await token2.balanceOf(liquidityProvider.address);
        expect(Number(balanceToken1After)).to.equal(
          Number(balanceToken1BeforeRemoval) + Number(amount)
        );
        expect(Number(balanceToken2After)).to.equal(
          Number(balanceToken2BeforeRemoval) + Number(amount)
        );
      });
      it("updates shares", async () => {
        expect(await amm.shares(liquidityProvider.address)).to.equal(0);
        expect(await amm.shares(deployer.address)).to.equal(shares(100));
        expect(await amm.totalShares()).to.equal(shares(100));
      });
    });
    describe("Failure", () => {
      it("reverts an ttempt to withdraw without any shares", async () => {
        await expect(amm.connect(liquidityProvider).removeLiquidity(shares(50)))
          .to.be.reverted;
      });
    });
  });
});
