// scripts/deploy-factory.ts
import hre from "hardhat";
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Deployer EOA:", signer.address);

  // Deploy the PaymentCollectorFactory
  const Factory = await ethers.getContractFactory("PaymentCollectorFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("Deployed PaymentCollectorFactory at:", factoryAddress);

  // Deploy a payment collector using CREATE3
  const salt = ethers.id("factory-dewrap-v1"); // same constant salt
  const tx = await factory.deploy(salt);
  const receipt = await tx.wait();

  // Get the deployed address
  const deployedAddress = await factory.compute(salt);
  console.log("Deployed payment collector at:", deployedAddress);
  console.log("Transaction hash:", receipt?.hash || tx.hash);

  console.log("Deployment completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
