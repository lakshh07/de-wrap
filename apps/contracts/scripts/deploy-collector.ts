// scripts/deploy-collector.ts
import hre from "hardhat";
import { ethers } from "hardhat";

const SALT = ethers.id("collector-salt-dewrap-v1");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Deployer EOA:", signer.address);

  const factoryAddr = "0x238CEfe0BCE72e50e028Dd56415Cee4A9b07A0a9";
  // const factoryAddr = "0x5A74D665696acEc36Ee9d79Fb52D76769E2e54b6";
  // const factoryAddr = process.env.FACTORY_ADDRESS!;
  if (!factoryAddr) {
    throw new Error("FACTORY_ADDRESS environment variable is required");
  }

  const factory = await ethers.getContractAt(
    "PaymentCollectorFactory",
    factoryAddr
  );

  const predicted = await factory.compute(SALT);
  console.log("Predicted collector address:", predicted);

  const tx = await factory.deploy(SALT);
  const receipt = await tx.wait();

  console.log("Collector deployed at:", predicted);
  console.log("Transaction hash:", receipt?.hash || tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
