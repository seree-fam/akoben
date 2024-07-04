import { task, types } from "hardhat/config"

task("verify:akoben-semaphore", "Verify a AkobenSemaphore contract")
    .addParam(
        "address",
        "AkobenSemaphore contract address",
        undefined,
        types.string
    )
    .addParam(
        "args",
        "AkobenSemaphore constructor arguments",
        undefined,
        types.json
    )
    .setAction(async ({ address, args }, { run }): Promise<void> => {
        try {
            await run("verify:verify", {
                address,
                constructorArguments: args
            })
        } catch (error) {
            console.error(error)
        }
    })
