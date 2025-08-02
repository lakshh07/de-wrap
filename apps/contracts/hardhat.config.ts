import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: process.env.MAINNET_KEY!,
      },
    },
    mainnetForked: {
      url: "http://127.0.0.1:8545",
      accounts: [process.env.PRIVATE_KEY!],
    },
    polygonForked: {
      url: "http://127.0.0.1:8546",
      accounts: [process.env.PRIVATE_KEY!],
    },
    sepolia: {
      url: process.env.SEPOLIA_KEY!,
      accounts: [process.env.PRIVATE_KEY!],
    },
    amoy: {
      url: process.env.AMOY_KEY!,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;
