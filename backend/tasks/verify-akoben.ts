import { task, types } from "hardhat/config"

task("verify:akoben", "Verify a Akoben contract")
    .addParam("address", "Akoben contract address", undefined, types.string)
    .setAction(async ({ address }, { run }): Promise<void> => {
        try {
            await run("verify:verify", {
                address
            })
        } catch (error) {
            console.error(error)
        }
    })
