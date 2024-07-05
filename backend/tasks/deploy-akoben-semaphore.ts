import { Contract } from "ethers";
import { task, types } from "hardhat/config";

task("deploy:akoben-semaphore", "Deploy a AkobenSemaphore contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .addOptionalParam("akoben", "akoben contract address", undefined, types.string)
    .addOptionalParam("semaphoreVerifier", "SemaphoreVerifier contract address", undefined, types.string)
    .setAction(
        async ({ logs, akoben: akobenAddress, semaphoreVerifier: semaphoreVerifierAddress }, { ethers, run }): Promise<Contract> => {
            if (!semaphoreVerifierAddress) {
                const PairingFactory = await ethers.getContractFactory("Pairing");
                const pairing = await PairingFactory.deploy();
                await pairing.waitForDeployment();  // Use the correct wait method

                if (logs) {
                    console.info(`Pairing library has been deployed to: ${pairing.target}`);
                }

                const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier", {
                    libraries: {
                        Pairing: pairing.target
                    }
                });

                const semaphoreVerifier = await SemaphoreVerifierFactory.deploy();
                await semaphoreVerifier.waitForDeployment();  // Use the correct wait method

                if (logs) {
                    console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifier.target}`);
                }

                semaphoreVerifierAddress = semaphoreVerifier.target;
            }

            if (!akobenAddress) {
                const akoben = await run("deploy:akoben", { logs });
                akobenAddress = akoben.target;
            }

            const ContractFactory = await ethers.getContractFactory("AkobenSemaphore");
            const contract = await ContractFactory.deploy(semaphoreVerifierAddress, akobenAddress);
            await contract.waitForDeployment();  // Use the correct wait method

            if (logs) {
                console.info(`AkobenSemaphore contract has been deployed to: ${contract.target}`);
            }

            return contract;
        }
    );
