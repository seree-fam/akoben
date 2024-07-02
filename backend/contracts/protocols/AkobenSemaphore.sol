//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IAkobenSemaphore} from "./IAkobenSemaphore.sol";
import {IAkoben} from "../IAkoben.sol";
import {ISemaphoreVerifier} from "@semaphore-protocol/contracts/interfaces/ISemaphoreVerifier.sol";

/// @title AkobenSemaphore
/// @dev This contract is used to verify Semaphore proofs.
contract AkobenSemaphore is IAkobenSemaphore {
    ISemaphoreVerifier public verifier;
    IAkoben public akoben;

    /// @dev Gets a group id and a nullifier hash and returns true if it has already been used.
    mapping(uint256 => mapping(uint256 => bool)) internal nullifierHashes;

    /// @dev Initializes the Semaphore verifier used to verify the user's ZK proofs.
    /// @param _verifier: Semaphore verifier address.
    /// @param _akoben: Akoben address.
    constructor(ISemaphoreVerifier _verifier, IBandada _bandada) {
        verifier = _verifier;
        akoben = _akoben;
    }

    /// @dev See {IAkobenSemaphore-verifyProof}.
    function verifyProof(
        uint256 groupId,
        uint256 merkleTreeRoot,
        uint256 merkleTreeDepth,
        uint256 signal,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external override {
        uint256 currentMerkleTreeRoot = akoben.groups(groupId);

        // A proof could have used an old Merkle tree root.
        // https://github.com/semaphore-protocol/semaphore/issues/98
        if (merkleTreeRoot != currentMerkleTreeRoot) {
            uint256 merkleRootCreationDate = akoben.getFingerprintCreationDate(
                groupId,
                merkleTreeRoot
            );
            uint256 merkleTreeDuration = akoben.fingerprintDuration(groupId);

            if (merkleRootCreationDate == 0) {
                revert AkobenSemaphore__MerkleTreeRootIsNotPartOfTheGroup();
            }

            if (block.timestamp > merkleRootCreationDate + merkleTreeDuration) {
                revert AkobenSemaphore__MerkleTreeRootIsExpired();
            }
        }

        if (nullifierHashes[groupId][nullifierHash]) {
            revert AkobenSemaphore__YouAreUsingTheSameNullifierTwice();
        }

        verifier.verifyProof(
            merkleTreeRoot,
            nullifierHash,
            signal,
            externalNullifier,
            proof,
            merkleTreeDepth
        );

        nullifierHashes[groupId][nullifierHash] = true;

        emit ProofVerified(
            groupId,
            merkleTreeRoot,
            nullifierHash,
            externalNullifier,
            signal
        );
    }
}