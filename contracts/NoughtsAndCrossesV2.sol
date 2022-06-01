// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

import "./NoughtsAndCrosses.sol";

/// @title Noughts and Crosses classical game (the test task for iLink Academy, 2022)
/// @author Vsevolod Medvedev
/// @notice Player can create or join a game, and once it started, do turns until win, draw or timeout
contract NoughtsAndCrossesV2 is NoughtsAndCrosses {
    uint256 upgrade_test;
}
