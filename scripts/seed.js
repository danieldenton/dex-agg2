const hre = require("hardhat");
const config = require("../src/config.json");

const tokens = (n) => {
  return hre.ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  console.log(`fetching accounts and network \n`);
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  const investor1 = accounts[1];
  const investor2 = accounts[2];
  const investor3 = accounts[3];
  const investor4 = accounts[4];

  const { chainId } = await hre.ethers.provider.getNetwork();

  const rump = await hre.ethers.getContractAt(
    "Token",
    config[chainId].rump.address
  );
  console.log(`Rumpelina Token fetched at: ${rump.address}\n`);
  const usd = await hre.ethers.getContractAt(
    "Token",
    config[chainId].usd.address
  );
  console.log(`USD Token fetched at: ${usd.address}\n`);

  let transaction;

  transaction = await rump
    .connect(deployer)
    .transfer(investor1.address, tokens(20));
  transaction = await usd
    .connect(deployer)
    .transfer(investor2.address, tokens(20));
  transaction = await rump
    .connect(deployer)
    .transfer(investor3.address, tokens(20));
  transaction = await usd
    .connect(deployer)
    .transfer(investor4.address, tokens(20));

  let amount = tokens(100);

  const amm = await hre.ethers.getContractAt(
    "AMM",
    config[chainId].amm.address
  );
  console.log(`AMM Token fetched at: ${amm.address}\n`);

  transaction = await rump.connect(deployer).approve(amm.address, amount);
  await transaction.wait();
  transaction = await usd.connect(deployer).approve(amm.address, amount);
  await transaction.wait();

  console.log("Adding Liquidity");
  transaction = await amm.connect(deployer).addLiquidity(amount, amount);
  await transaction.wait();

  console.log("Swapping");
  transaction = await rump.connect(investor1).approve(amm.address, tokens(10));
  await transaction.wait();

  transaction = await amm
    .connect(investor1)
    .swapToken(rump.address, usd.address, tokens(1));
  await transaction.wait();

  transaction = await usd.connect(investor2).approve(amm.address, tokens(10));
  await transaction.wait();

  transaction = await amm
    .connect(investor2)
    .swapToken(usd.address, rump.address, tokens(1));
  await transaction.wait();

  transaction = await rump.connect(investor3).approve(amm.address, tokens(10));
  await transaction.wait();

  transaction = await amm
    .connect(investor3)
    .swapToken(rump.address, usd.address, tokens(10));
  await transaction.wait();

  transaction = await usd.connect(investor4).approve(amm.address, tokens(10));
  await transaction.wait();

  transaction = await amm
    .connect(investor4)
    .swapToken(usd.address, rump.address, tokens(5));
  await transaction.wait();

  console.log("finished");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
