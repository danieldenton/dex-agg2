require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const privateKey = process.env.PRIVATE_KEY || "";


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      forking: {
        url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 223528000
      },
    }
  }
};