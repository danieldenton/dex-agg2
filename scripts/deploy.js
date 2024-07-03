// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");

  let rump = await Token.deploy("Rumpelina Token", "RUMP", "1000000");
  await rump.deployed();
  console.log(`Rumpelina Token deployed to: ${rump.address}\n`);

  let usd = await Token.deploy("USD Token", "USD", "1000000");
  await usd.deployed();
  console.log(`USD Token deployed to: ${usd.address}\n`);

  const AMM = await hre.ethers.getContractFactory("AMM");
  let amm = await AMM.deploy(rump.address, usd.address);
  await amm.deployed();
  console.log(`AMM deployed to: ${amm.address}\n`);

}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
