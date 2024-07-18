// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
const DEX_AGGREGATOR = await hre.ethers.getContractFactory("DexAggregator");
  let dexAggregator = await DEX_AGGREGATOR.deploy(bloodMoonSwap.address, cloudSwap.address);
  await dexAggregator.deployed();
  console.log(`Dex Aggregator deployed to: ${dexAggregator.address}\n`);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
