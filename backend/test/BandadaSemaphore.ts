import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { FullProof, generateProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { BigNumber, utils } from "ethers"
import { run } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation.
// eslint-disable-next-line import/extensions
import { Akoben, AkobenSemaphore } from "../typechain-types"

describe("AkobenSemaphore", () => {
    let akoben: Akoben
    let akobenSemaphore: AkobenSemaphore

    const groupId = utils.formatBytes32String("Name")
    const identities = [0, 1].map((i) => new Identity(i.toString()))
    const group = new Group(BigNumber.from(groupId).toBigInt())

    group.addMembers(identities.map(({ commitment }) => commitment))

    before(async () => {
        akoben = await run("deploy:akoben", {
            logs: false
        })

        akobenSemaphore = await run("deploy:akoben-semaphore", {
            logs: false,
            akoben: akoben.address
        })

        await akoben.updateGroups([
            {
                id: groupId,
                fingerprint: group.root
            }
        ])
    })

    describe("# verifyProof", () => {
        const wasmFilePath = `../../snark-artifacts/semaphore.wasm`
        const zkeyFilePath = `../../snark-artifacts/semaphore.zkey`

        const signal = utils.formatBytes32String("Hello World")

        let fullProof: FullProof

        before(async () => {
            fullProof = await generateProof(
                identities[0],
                group,
                group.root,
                signal,
                { wasmFilePath, zkeyFilePath }
            )
        })

        it("Should throw an exception if the proof is not valid", async () => {
            const transaction = akobenSemaphore.verifyProof(
                groupId,
                group.root,
                group.depth,
                signal,
                fullProof.nullifierHash,
                0,
                fullProof.proof
            )

            await expect(transaction).to.be.reverted
        })

        it("Should verify a proof for an off-chain group correctly", async () => {
            const transaction = akobenSemaphore.verifyProof(
                groupId,
                group.root,
                group.depth,
                signal,
                fullProof.nullifierHash,
                group.root,
                fullProof.proof
            )

            await expect(transaction)
                .to.emit(akobenSemaphore, "ProofVerified")
                .withArgs(
                    groupId,
                    group.root,
                    fullProof.nullifierHash,
                    group.root,
                    signal
                )
        })

        it("Should not verify the same proof for an off-chain group twice", async () => {
            const transaction = akobenSemaphore.verifyProof(
                groupId,
                group.root,
                group.depth,
                signal,
                fullProof.nullifierHash,
                group.root,
                fullProof.proof
            )

            await expect(transaction).to.be.revertedWithCustomError(
                akobenSemaphore,
                "AkobenSemaphore__YouAreUsingTheSameNullifierTwice"
            )
        })

        it("Should not verify a proof if the Merkle tree root is expired", async () => {
            fullProof = await generateProof(
                identities[0],
                group,
                group.root,
                signal,
                {
                    wasmFilePath,
                    zkeyFilePath
                }
            )

            group.addMember(new Identity("3").commitment)

            await akoben.updateGroups([
                {
                    id: groupId,
                    fingerprint: group.root
                }
            ])

            const transaction = akobenSemaphore.verifyProof(
                groupId,
                fullProof.merkleTreeRoot,
                group.depth,
                signal,
                fullProof.nullifierHash,
                fullProof.merkleTreeRoot,
                fullProof.proof
            )

            await expect(transaction).to.be.revertedWithCustomError(
                akobenSemaphore,
                "AkobenSemaphore__MerkleTreeRootIsExpired"
            )
        })
    })
})
