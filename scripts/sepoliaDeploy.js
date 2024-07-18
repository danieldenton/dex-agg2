// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const cloudSwap = "0xa1C9B19F42d9Db15E95e06218257F36b2eD0467D";
  const bloodMoonSwap = "0x284A83712a1eef1F4D6f90011F17b1F492C3BCeF";
  const DEX_AGGREGATOR = await hre.ethers.getContractFactory("DexAggregator");
  let dexAggregator = await DEX_AGGREGATOR.deploy(
    bloodMoonSwap,
    cloudSwap
  );
  await dexAggregator.deployed();
  console.log(`Dex Aggregator deployed to: ${dexAggregator.address}\n`);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
