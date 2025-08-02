import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting DewrapPaymentCollector deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    ethers.formatEther(await deployer.provider!.getBalance(deployer.address)),
    "ETH"
  );

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId, ")");

  try {
    // Deploy DewrapPaymentCollector
    console.log("\n📦 Deploying DewrapPaymentCollector...");
    const DewrapPaymentCollector = await ethers.getContractFactory(
      "DewrapPaymentCollector"
    );
    const paymentCollector = await DewrapPaymentCollector.deploy();

    await paymentCollector.waitForDeployment();
    const paymentCollectorAddress = await paymentCollector.getAddress();

    console.log(
      "✅ DewrapPaymentCollector deployed to:",
      paymentCollectorAddress
    );
    console.log(
      "🔗 Transaction hash:",
      paymentCollector.deploymentTransaction()?.hash
    );

    // Log deployment summary
    console.log("\n📊 Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Contract: DewrapPaymentCollector");
    console.log("Address:", paymentCollectorAddress);
    console.log("Network:", network.name);
    console.log("Deployer:", deployer.address);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      paymentCollector,
      paymentCollectorAddress,
    };
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
main()
  .then(() => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error);
    process.exit(1);
  });
