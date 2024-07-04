import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:akoben-semaphore", "Deploy a AkobenSemaphore contract")
    .addOptionalParam<boolean>("logs", "Print the logs", true, types.boolean)
    .addOptionalParam(
        "akoben",
        "akoben contract address",
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
            if (!semaphoreVerifierAddress) {
                const PairingFactory = await ethers.getContractFactory(
                    "Pairing"
                )
                const pairing = await PairingFactory.deploy()

                await pairing.deployed()

                if (logs) {
                    console.info(
                        `Pairing library has been deployed to: ${pairing.address}`
                    )
                }

                const SemaphoreVerifierFactory =
                    await ethers.getContractFactory("SemaphoreVerifier", {
                        libraries: {
                            Pairing: pairing.address
                        }
                    })

                const semaphoreVerifier =
                    await SemaphoreVerifierFactory.deploy()

                await semaphoreVerifier.deployed()

                if (logs) {
                    console.info(
                        `SemaphoreVerifier contract has been deployed to: ${semaphoreVerifier.address}`
                    )
                }

                semaphoreVerifierAddress = semaphoreVerifier.address
            }

            if (!akobenAddress) {
                const akoben = await run("deploy:akoben", {
                    logs
                })

                akobenAddress = akoben.address
            }

            const ContractFactory = await ethers.getContractFactory(
                "AkobenSemaphore"
            )

            const contract = await ContractFactory.deploy(
                semaphoreVerifierAddress,
                akobenAddress
            )

            await contract.deployed()

            if (logs) {
                console.info(
                    `BandadaSemaphore contract has been deployed to: ${contract.address}`
                )
            }

            return contract
        }
    )
