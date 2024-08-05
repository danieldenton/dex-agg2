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
    fee,
    amountMinusFee,
    amountAfterFee,
    investor1,
    investor2,
    amm1Token1ReturnAmount,
    amm2Token2ReturnAmount;

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

    // add liquidity to AMMs
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

    // create a swap on AMM1 which will make token1 cheaper on AMM1 ... with enough of a traded anyhow.
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

    // // Calls to the AMM to check the dex agg
    // // charge the fee first
    amount = tokens(16);
    fee = (16 * 3) / 10000;
    amountMinusFee = 16 - fee;
    amountAfterFee = tokens(amountMinusFee);
    [amm2Token2ReturnAmount] = await amm2.calculateTokenSwap(
      token1.address,
      token2.address,
      amountAfterFee
    );
    [amm1Token1ReturnAmount] = await amm1.calculateTokenSwap(
      token2.address,
      token1.address,
      amountAfterFee
    );
  });
  describe("Deployment", () => {
    it("has an address", async () => {
      expect(dexAggregator.address).to.not.equal(0x0);
    });
    it("returns the owner", async () => {
      expect(await dexAggregator.owner()).to.equal(deployer.address);
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
      const [chosenAMM, returnAmount] = await dexAggregator.dexSelector(
        token1.address,
        token2.address,
        amount
      );
      expect(chosenAMM).to.equal(amm2.address);
      expect(returnAmount).to.equal(amm2Token2ReturnAmount);
    });
    it("finds the best amm for your token2 swap", async () => {
      const [chosenAMM, returnAmount] = await dexAggregator.dexSelector(
        token2.address,
        token1.address,
        amount
      );
      expect(chosenAMM).to.equal(amm1.address);
      expect(returnAmount).to.equal(amm1Token1ReturnAmount);
    });
  });
  describe("Performs Swaps and Charges Fees", () => {
    const formattedGiveAmount = formatEther(tokens(16));
    describe("Success", () => {
      it("separates fee", async () => {
        const [_amountAfterFee, _fee] = await dexAggregator.separateFee(amount);
        expect(_amountAfterFee).to.equal(amountAfterFee);
        expect(_fee).to.equal(tokens(fee));
      });
      it("successfully swaps token1 for token2 ", async () => {
        const investor1Token1BalanceBeforeSwap = formatEther(
          await token1.balanceOf(investor1.address)
        );
        const investor1Token2BalanceBeforeSwap = formatEther(
          await token2.balanceOf(investor1.address)
        );
        transaction = await token1
          .connect(investor1)
          .approve(dexAggregator.address, amount);
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
        expect(await token1.balanceOf(dexAggregator.address)).to.equal(
          tokens(fee)
        );
      });
      it("successfully swaps token2 for token1 ", async () => {
        const investor2Token1BalanceBeforeSwap = formatEther(
          await token1.balanceOf(investor2.address)
        );
        const investor2Token2BalanceBeforeSwap = formatEther(
          await token2.balanceOf(investor2.address)
        );
        transaction = await token2
          .connect(investor2)
          .approve(dexAggregator.address, amount);
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
        expect(await token2.balanceOf(dexAggregator.address)).to.equal(
          tokens(fee)
        );
      });
      it("emits a Swap event", async () => {
        const [chosenAMM, returnAmount] = await dexAggregator.dexSelector(
          token1.address,
          token2.address,
          amount
        );
        transaction = await token1
        .connect(investor1)
        .approve(dexAggregator.address, amount);
      await transaction.wait();
      transaction = await dexAggregator
        .connect(investor1)
        .swap(token1.address, token2.address, amount);
      await transaction.wait();
        await expect(transaction)
          .to.emit(dexAggregator, "Swap")
          .withArgs(
            investor1.address,
            chosenAMM,
            token1.address,
            amount,
            tokens(fee),
            token2.address,
            returnAmount,
            (
              await ethers.provider.getBlock(
                await ethers.provider.getBlockNumber()
              )
            ).timestamp
          );
      })
    });
    describe("Failure", () => {
      it("it reverts for insuffucient funds", async () => {
        transaction = await token1
          .connect(investor2)
          .approve(dexAggregator.address, amount);
        await transaction.wait();
        await expect(
          dexAggregator
            .connect(investor2)
            .swap(token1.address, token2.address, amount)
        ).to.be.reverted;
      });
    });
  });
  describe("Withdrawals", () => {
    describe("Success", () => {
      let ownerBalanceBeforeWithdrawal, ownerBalanceAfter;
      it("successfully withdraws tokenBalances", async () => {
        ownerBalanceBeforeWithdrawal = await token2.balanceOf(deployer.address);
        transaction = await token2
          .connect(investor2)
          .approve(dexAggregator.address, amount);
        await transaction.wait();
        transaction = await dexAggregator
          .connect(investor2)
          .swap(token2.address, token1.address, amount);
        await transaction.wait();
        transaction = await dexAggregator
          .connect(deployer)
          .withdrawTokenBalance(token2.address);
        await transaction.wait();
        ownerBalanceAfter = await token2.balanceOf(deployer.address);
        expect(
          Number(ownerBalanceBeforeWithdrawal) + Number(tokens(fee))
        ).to.equal(Number(ownerBalanceAfter));
      });
    });
    describe("Failure", () => {
      it("doesn't allow a non-owner to withdraw", async () => {
        await expect(
          dexAggregator.connect(investor1).withdrawTokenBalance(token2.address)
        ).to.be.reverted;
      });
    });
  });
});
