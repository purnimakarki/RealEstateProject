const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy RealEstateTokenFactory contract
  console.log("Deploying RealEstateTokenFactory...");
  const RealEstateTokenFactory = await ethers.getContractFactory("RealEstateTokenFactory");
  const realEstateTokenFactory = await RealEstateTokenFactory.deploy();
  await realEstateTokenFactory.waitForDeployment();
  console.log("RealEstateTokenFactory deployed to:", await realEstateTokenFactory.getAddress());

  // Save contract address and ABI for frontend use
  const contractsDir = path.join(__dirname, "../frontend/contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({
      RealEstateTokenFactory: await realEstateTokenFactory.getAddress(),
    }, undefined, 2)
  );

  const realEstateTokenFactoryArtifact = await artifacts.readArtifact("RealEstateTokenFactory");

  fs.writeFileSync(
    contractsDir + "/RealEstateTokenFactoryABI.json",
    JSON.stringify(realEstateTokenFactoryArtifact.abi, undefined, 2)
  );

  console.log("Contract ABI saved to frontend/contracts");

  // Save PropertyToken ABI for frontend use
  const propertyTokenArtifact = await artifacts.readArtifact("PropertyToken");

  fs.writeFileSync(
    contractsDir + "/PropertyTokenABI.json",
    JSON.stringify(propertyTokenArtifact.abi, undefined, 2)
  );

  console.log("PropertyToken ABI saved to frontend/contracts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
