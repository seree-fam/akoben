import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:akoben", "Deploy a Akoben contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)

    .setAction(async ({ logs }, { ethers }): Promise<Contract> => {
        const ContractFactory = await ethers.getContractFactory("Akoben")

        const contract = await ContractFactory.deploy()

        await contract.deployed()

        if (logs) {
            console.info(
                `Akoben contract has been deployed to: ${contract.address}`
            )
        }

        return contract
    })
