// scripts/check-contract-deployment.ts
import hre from "hardhat";
import { ethers } from "hardhat";

async function checkContractDeployment(contractAddress: string) {
  console.log(`Checking contract deployment at: ${contractAddress}`);
  console.log("=".repeat(50));

  try {
    // Method 1: Check if address has code (basic check)
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ No contract deployed at this address");
      return false;
    }
    console.log("✅ Contract code found at address");

    // Method 2: Try to create contract instance and call a view function
    try {
      const contract = await ethers.getContractAt(
        "DewrapPaymentCollector",
        contractAddress
      );

      // Try to call a view function to verify it's the right contract
      const paused = await contract.paused();
      console.log(
        "✅ Successfully called contract function - paused status:",
        paused
      );

      // Try to get the owner
      const owner = await contract.owner();
      console.log("✅ Contract owner:", owner);

      console.log("✅ Contract is deployed and accessible");
      return true;
    } catch (error) {
      console.log("⚠️  Contract exists but may not be DewrapPaymentCollector");
      console.log(
        "Error details:",
        error instanceof Error ? error.message : error
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Error checking contract deployment:", error);
    return false;
  }
}

async function main() {
  // Get contract address from command line argument or environment variable
  const contractAddress = "0x80416f9EBb0d5E7bd01173F9A10A5982E1e1279A";

  if (!contractAddress) {
    console.error(
      "Please provide a contract address as an argument or set CONTRACT_ADDRESS environment variable"
    );
    console.log(
      "Usage: npx hardhat run scripts/check-contract-deployment.ts -- <contract-address>"
    );
    process.exit(1);
  }

  // Validate address format
  if (!ethers.isAddress(contractAddress)) {
    console.error("❌ Invalid Ethereum address format");
    process.exit(1);
  }

  const isDeployed = await checkContractDeployment(contractAddress);

  if (isDeployed) {
    console.log("\n🎉 Contract verification successful!");
  } else {
    console.log("\n❌ Contract verification failed!");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
