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
  describe("Swapping Tokens", () => {
    let amount, estimate, balance;
    it("facilitates swaps", async () => {
      amount = tokens(100000);
      let k = tokens(100000).toBigInt() * tokens(100000).toBigInt();
      transaction = await token1.connect(deployer).approve(amm.address, amount);
      await transaction.wait();
      transaction = await token2.connect(deployer).approve(amm.address, amount);
      await transaction.wait();
      transaction = await amm.connect(deployer).addLiquidity(amount, amount);
      await transaction.wait();
      expect(await token1.balanceOf(amm.address)).to.equal(amount);
      expect(await token2.balanceOf(amm.address)).to.equal(amount);
      expect(await amm.K()).to.equal(k);
      expect(await amm.token1Balance()).to.equal(amount);
      expect(await amm.token2Balance()).to.equal(amount);
      expect(await amm.shares(deployer.address)).to.equal(tokens(100));
      expect(await amm.totalShares()).to.equal(tokens(100));

      amount = tokens(50000);
      transaction = await token1
        .connect(liquidityProvider)
        .approve(amm.address, amount);
      await transaction.wait();
      transaction = await token2
        .connect(liquidityProvider)
        .approve(amm.address, amount);
      await transaction.wait();

      let token2Deposit = await amm.calculateToken2Deposit(amount);
      transaction = await amm
        .connect(liquidityProvider)
        .addLiquidity(amount, token2Deposit);
      await transaction.wait();
      expect(await amm.shares(liquidityProvider.address)).to.equal(tokens(50));
      expect(await amm.shares(deployer.address)).to.equal(tokens(100));
      expect(await amm.totalShares()).to.equal(tokens(150));

      console.log((await amm.token2Balance()) / (await amm.token1Balance()));

      transaction = await token1
        .connect(investor1)
        .approve(amm.address, tokens(100000));
      await transaction.wait();

      balance = await token2.balanceOf(investor1.address);

      estimate = await amm.calculateToken1Swap(tokens(1));

      transaction = await amm.connect(investor1).swapToken1(tokens(1));
      await transaction.wait();

      await expect(transaction)
        .to.emit(amm, "Swap")
        .withArgs(
          investor1.address,
          token1.address,
          tokens(1),
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

      balance = await token2.balanceOf(investor1.address);
      expect(estimate).to.equal(balance);

      expect(await token1.balanceOf(amm.address)).to.equal(
        await amm.token1Balance()
      );
      expect(await token2.balanceOf(amm.address)).to.equal(
        await amm.token2Balance()
      );

      console.log((await amm.token2Balance()) / (await amm.token1Balance()));

      balance = await token2.balanceOf(investor1.address);

      estimate = await amm.calculateToken1Swap(tokens(1));

      transaction = await amm.connect(investor1).swapToken1(tokens(1));
      await transaction.wait();

      balance = await token2.balanceOf(investor1.address);
      console.log(balance);

      transaction = await token2
        .connect(investor2)
        .approve(amm.address, tokens(10000));
      await transaction.wait();

      balance = await token1.balanceOf(investor2.address);
      console.log(balance);

      estimate = await amm.calculateToken2Swap(tokens(1));
      console.log(estimate);

      transaction = await amm.connect(investor2).swapToken2(tokens(1));
      await transaction.wait();

      await expect(transaction)
        .to.emit(amm, "Swap")
        .withArgs(
          investor2.address,
          token2.address,
          tokens(1),
          token1.address,
          estimate,
          await amm.token1Balance(),
          await amm.token2Balance(),
          (
            await ethers.provider.getBlock(
              await ethers.provider.getBlockNumber()
            )
          ).timestamp
        );

      //   Removing Liquidity

      console.log(
        `token 1 balance: ${ethers.utils.formatEther(
          await amm.token1Balance()
        )}`
      );
      console.log(
        `token 2 balance: ${ethers.utils.formatEther(
          await amm.token2Balance()
        )}`
      );

      balance = await token1.balanceOf(liquidityProvider.address);
      console.log(
        `liquidity provider's token 1 balance before removing funds: ${ethers.utils.formatEther(
          balance
        )}`
      );

      balance = await token2.balanceOf(liquidityProvider.address);
      console.log(
        `liquidity provider's token 2 balance before removing funds: ${ethers.utils.formatEther(
          balance
        )}`
      );

      transaction = await amm
        .connect(liquidityProvider)
        .removeLiquidity(shares(50));
      await transaction.wait();

      balance = await token1.balanceOf(liquidityProvider.address);
      console.log(
        `liquidity provider's token 1 balance after removing funds: ${ethers.utils.formatEther(
          balance
        )}`
      );
      balance = await token2.balanceOf(liquidityProvider.address);
      console.log(
        `liquidity provider's token 2 balance after removing funds: ${ethers.utils.formatEther(
          balance
        )}`
      );

      expect(await amm.shares(liquidityProvider.address)).to.equal(0);
      expect(await amm.shares(deployer.address)).to.equal(shares(100));
      expect(await amm.totalShares()).to.equal(shares(100));
    });
  });
});
