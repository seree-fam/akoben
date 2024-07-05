import { Contract } from "ethers";
import { task, types } from "hardhat/config";

task("deploy:akoben-semaphore", "Deploy an AkobenSemaphore contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .addOptionalParam(
        "akoben",
        "Akoben contract address",
        undefined,
        types.string
    )
    .addOptionalParam(
        "semaphoreVerifier",
        "SemaphoreVerifier contract address",
        undefined,
        types.string
    )
    .setAction(
        async (
            {
                logs,
                akoben: akobenAddress,
                semaphoreVerifier: semaphoreVerifierAddress
            },
            { ethers, run }
        ): Promise<Contract> => {
            // Deploy Pairing library if SemaphoreVerifier address is not provided
            if (!semaphoreVerifierAddress) {
                const PairingFactory = await ethers.getContractFactory("Pairing");
                const pairing = await PairingFactory.deploy();

                await pairing.deployed();

                if (logs) {
                    console.info(
                        `Pairing library deployed to: ${pairing.address}`
                    );
                }

                const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier", {
                    libraries: {
                        Pairing: pairing.address
                    }
                });
                const semaphoreVerifier = await SemaphoreVerifierFactory.deploy();
                
                await semaphoreVerifier.deployed();

                if (logs) {
                    console.info(
                        `SemaphoreVerifier deployed to: ${semaphoreVerifier.address}`
                    );
                }

                semaphoreVerifierAddress = semaphoreVerifier.address;
            }

            // Deploy Akoben contract if Akoben address is not provided
            if (!akobenAddress) {
                const akoben = await run("deploy:akoben", { logs });
                akobenAddress = akoben.address;
            }

            // Deploy AkobenSemaphore contract
            const AkobenSemaphoreFactory = await ethers.getContractFactory("AkobenSemaphore");
            const contract = await AkobenSemaphoreFactory.deploy(semaphoreVerifierAddress, akobenAddress);

            await contract.deployed();

            if (logs) {
                console.info(
                    `AkobenSemaphore deployed to: ${contract.address}`
                );
            }

            // Return the contract instance
            return contract;
        }
    );

export {};
