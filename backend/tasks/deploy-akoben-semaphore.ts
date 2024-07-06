import { Contract } from "ethers";
import { task, types } from "hardhat/config";

task("deploy:akoben-semaphore", "Deploy an AkobenSemaphore contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .addOptionalParam<string>("akoben", "Akoben contract address", undefined, types.string)
    .addOptionalParam<string>("semaphoreVerifier", "SemaphoreVerifier contract address", undefined, types.string)
    .setAction(async ({ logs, akoben: akobenAddress, semaphoreVerifier: semaphoreVerifierAddress }, { ethers, run }): Promise<Contract> => {
        let semaphoreVerifierAddr = semaphoreVerifierAddress;

        // Deploy Pairing library if SemaphoreVerifier address is not provided
        if (!semaphoreVerifierAddr) {
            const PairingFactory = await ethers.getContractFactory("Pairing");
            const pairing = await PairingFactory.deploy();
            await pairing.waitForDeployment();

            if (logs) {
                console.info(`Pairing library deployed to: ${pairing.getAddress()}`);
            }

            const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier", {
                libraries: {
                    Pairing: pairing.getAddress()
                }
            });
            const semaphoreVerifier = await SemaphoreVerifierFactory.deploy();
            await semaphoreVerifier.waitForDeployment();

            if (logs) {
                console.info(`SemaphoreVerifier deployed to: ${semaphoreVerifier.target}`);
            }

            semaphoreVerifierAddr = semaphoreVerifier.target;
        }

        // Deploy Akoben contract if Akoben address is not provided
        let akobenAddr = akobenAddress;
        if (!akobenAddr) {
            const akoben = await run("deploy:akoben", { logs });
            akobenAddr = akoben.address;
        }

        // Deploy AkobenSemaphore contract
        const AkobenSemaphoreFactory = await ethers.getContractFactory("AkobenSemaphore");
        const akobenSemaphore = await AkobenSemaphoreFactory.deploy(semaphoreVerifierAddr, akobenAddr);
        await akobenSemaphore.waitForDeployment();

        if (logs) {
            console.info(`AkobenSemaphore deployed to: ${akobenSemaphore.target}`);
        }
        
        // Add a delay or a check to ensure the contracts have been deployed
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds delay

        // Return the contract instance
        return akobenSemaphore;
    });

export {};
