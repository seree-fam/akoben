//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IAkoben} from "./IAkoben.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Akoben
/// @dev This contract is used to save the groups fingerprints.
contract Akoben is IAkoben, Ownable {
    /// @dev See {IAkoben-groups}.
    mapping(uint256 => uint256) public override groups;

    mapping(uint256 => mapping(uint256 => uint256))
        public fingerprintCreationDates;

    /// @dev See {IAkoben-fingerprintDuration}.
    mapping(uint256 => uint256) public override fingerprintDuration;

    /// @dev See {IAkoben-updateGroups}.
    function updateGroups(
        Group[] calldata _groups
    ) external override onlyOwner {
        for (uint256 i = 0; i < _groups.length; ) {
            groups[_groups[i].id] = _groups[i].fingerprint;

            fingerprintCreationDates[_groups[i].id][
                _groups[i].fingerprint
            ] = block.timestamp;

            emit GroupUpdated(_groups[i].id, _groups[i].fingerprint);

            unchecked {
                ++i;
            }
        }
    }

    /// @dev See {IAkoben-getFingerprintCreationDate}.
    function getFingerprintCreationDate(
        uint256 groupId,
        uint256 fingerprint
    ) external view override returns (uint256) {
        return fingerprintCreationDates[groupId][fingerprint];
    }

    /// @dev See {IAkoben-updateFingerprintDuration}.
    function updateFingerprintDuration(
        uint256 groupId,
        uint256 durationSeconds
    ) external override onlyOwner {
        fingerprintDuration[groupId] = durationSeconds;
    }
}