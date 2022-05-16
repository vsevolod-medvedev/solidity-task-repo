// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

/// @title The test task for iLink Academy, 2022
/// @author Vsevolod Medvedev
/// @notice Noughts and Crosses classical game
contract NoughtsAndCrosses {
    enum FieldValue {
        Empty,
        Cross,
        Nought
    }

    enum GameState {
        Draw,
        InProcess,
        Player1Win,
        Player2Win,
        WaitingForPlayer2ToJoin
    }

    struct GameField {
        FieldValue[2][2] values;
    }

    struct Game {
        address player1;
        address player2;
        uint256 id;
        GameField field;
        GameState state;
    }

    Game[] games;

    event GameCreated(uint256 indexed id, address indexed owner);

    function createGame(uint256 timeout) external {
        uint256 id = games.length;

        GameField memory field;
        for (uint256 i = 0; i < 3; i++) for (uint256 j = 0; j < 3; j++) field.values[i][j] = FieldValue.Empty;

        Game memory game = Game(msg.sender, address(0), id, field, GameState.WaitingForPlayer2ToJoin);
        games.push(game);

        emit GameCreated(game.id, game.player1);
    }

    function joinGame() external {}

    function makeTurn() external {}

    function getWin() external {}

    function _check(uint256 gameId) private returns (GameState) {
        GameField memory field = games[gameId].field;

        // Check rows and columns
        for (uint256 i = 0; i < 3; i++) {
            if (field.values[i][0] == field.values[i][1] == field.values[i][2] == FieldValue.Cross || field.values[0][i] == field.values[1][i] == field.values[2][i] == FieldValue.Cross) {
                return GameState.Player1Win;
            }
            if (field.values[i][0] == field.values[i][1] == field.values[i][2] == FieldValue.Nought || field.values[0][i] == field.values[1][i] == field.values[2][i] == FieldValue.Nought) {
                return GameState.Player2Win;
            }
        }

        // Check diagonals
        if (field.values[0][0] == field.values[1][1] == field.values[2][2] == FieldValue.Cross || field.values[2][0] == field.values[1][1] == field.values[0][2] == FieldValue.Cross) {
            return GameState.Player1Win;
        }
        if (field.values[0][0] == field.values[1][1] == field.values[2][2] == FieldValue.Nought || field.values[2][0] == field.values[1][1] == field.values[0][2] == FieldValue.Nought) {
            return GameState.Player2Win;
        }

        // Check for draw
        bool isDraw = true;
        for (uint256 i = 0; i < 3; i++)
            for (uint256 j = 0; j < 3; j++)
                if (field.values[i][j] == FieldValue.Empty) {
                    isDraw = false;
                }
        if (isDraw) {
            return GameState.Draw;
        }

        return GameState.InProcess;
    }
}
