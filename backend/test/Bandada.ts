import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { expect } from "chai"
import { BigNumber, utils } from "ethers"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation.
// eslint-disable-next-line import/extensions
import { Akoben } from "../typechain-types"

describe("Akoben", () => {
    let akoben: Akoben

    const groupId = utils.formatBytes32String("Name")
    const identities = [0, 1].map((i) => new Identity(i.toString()))
    const group = new Group(BigNumber.from(groupId).toBigInt(), 20)

    group.addMembers(identities.map(({ commitment }) => commitment))

    before(async () => {
        akoben = await run("deploy:akoben", {
            logs: false
        })
    })

    describe("# updateGroups", () => {
        it("Should update groups", async () => {
            const transaction = akoben.updateGroups([
                {
                    id: groupId,
                    fingerprint: group.root
                }
            ])

            await expect(transaction)
                .to.emit(akoben, "GroupUpdated")
                .withArgs(groupId, group.root)
        })
    })

    describe("# groups", () => {
        it("Should get the current fingerprint of an off-chain group", async () => {
            const fingerprint = await akoben.groups(groupId)

            expect(fingerprint).to.equal(group.root)
        })
    })

    describe("# updateFingerprintDuration", () => {
        it("Should update the fingerprint duration", async () => {
            const duration = 3600

            await akoben.updateFingerprintDuration(groupId, duration)

            const fingerprintDuration = await akoben.fingerprintDuration(
                groupId
            )

            expect(duration).to.equal(fingerprintDuration)
        })
    })
})
