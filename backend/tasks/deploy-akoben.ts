import { task } from "hardhat/config";
import { Contract } from "ethers";

task("deploy:akoben", "Deploys the Akoben contract")
  .setAction(async (taskArgs, hre) => {
    const Akoben = await hre.ethers.getContractFactory("Akoben");
    const akoben = await Akoben.deploy();

    await akoben.waitForDeployment();

    console.log("Contract object:", akoben); // Log the contract object for inspection

    console.log("Akoben deployed to:", akoben.target);

    return akoben;
  });
