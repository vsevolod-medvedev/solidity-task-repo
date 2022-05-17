// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Noughts and Crosses classical game (the test task for iLink Academy, 2022)
/// @author Vsevolod Medvedev
/// @notice Player can create or join a game, and once it started, do turns until win, draw or timeout
contract NoughtsAndCrosses {
    enum FieldValue {
        Empty,
        Cross,
        Nought
    }

    enum GameState {
        Draw,
        Player1Turn,
        Player2Turn,
        Player1Win,
        Player2Win,
        Timeout,
        WaitingForPlayer2ToJoin
    }

    struct GameField {
        FieldValue[3][3] values;
    }

    struct Game {
        address player1;
        address player2;
        uint256 id;
        uint256 startedAt;
        uint256 timeout;
        GameField field;
        GameState state;
    }

    Game[] games;

    event GameCreated(uint256 indexed id, address indexed owner);

    modifier onlyState(uint256 _gameId, GameState _state) {
        require(games[_gameId].state == _state, "The game is in another state");
        _;
    }

    /// @notice Create a Noughts and Crosses game. A caller becomes player1 and waits for player2 to join
    /// @param _timeout Timeout for a turn in seconds
    function createGame(uint256 _timeout) external {
        uint256 id = games.length;

        GameField memory field;
        for (uint256 i = 0; i < 3; i++) for (uint256 j = 0; j < 3; j++) field.values[i][j] = FieldValue.Empty;

        Game memory game = Game(msg.sender, address(0), id, _timeout, 0, field, GameState.WaitingForPlayer2ToJoin);
        games.push(game);

        emit GameCreated(game.id, game.player1);
    }

    /// @notice List created games
    function listCreatedGames() external view returns (Game[] memory) {
        uint256 size = 0;
        for (uint256 i = 0; i < games.length; i++) {
            if (games[i].state == GameState.WaitingForPlayer2ToJoin) {
                size++;
            }
        }
        Game[] memory filtered = new Game[](size);
        uint256 j = 0;
        for (uint256 i = 0; i < games.length; i++) {
            if (games[i].state == GameState.WaitingForPlayer2ToJoin) {
                filtered[j] = games[i];
                j++;
            }
        }
        return filtered;
    }

    /// @notice Join the specified game. A caller becomes player2 and waits for player1 to make turn
    /// @param _gameId Game to join
    function joinGame(uint256 _gameId) external onlyState(_gameId, GameState.WaitingForPlayer2ToJoin) {
        games[_gameId].player2 = msg.sender;
        games[_gameId].startedAt = block.timestamp;
        games[_gameId].state = GameState.Player1Turn;
    }

    /// @notice Make turn. Can only be called by the player whose turn it is now
    function makeTurn() external {}

    /// @notice Get win. Can only be called by the player who won.
    function getWin() external {}

    function _check(uint256 _gameId) private view returns (GameState) {
        GameField memory field = games[_gameId].field;
        GameState currentState = games[_gameId].state;

        // Check rows and columns
        for (uint256 i = 0; i < 3; i++) {
            if (
                (field.values[i][0] == FieldValue.Cross &&
                    field.values[i][1] == FieldValue.Cross &&
                    field.values[i][2] == FieldValue.Cross) ||
                (field.values[0][i] == FieldValue.Cross &&
                    field.values[1][i] == FieldValue.Cross &&
                    field.values[2][i] == FieldValue.Cross)
            ) {
                return GameState.Player1Win;
            }
            if (
                (field.values[i][0] == FieldValue.Nought &&
                    field.values[i][1] == FieldValue.Nought &&
                    field.values[i][2] == FieldValue.Nought) ||
                (field.values[0][i] == FieldValue.Nought &&
                    field.values[1][i] == FieldValue.Nought &&
                    field.values[2][i] == FieldValue.Nought)
            ) {
                return GameState.Player2Win;
            }
        }

        // Check diagonals
        if (
            (field.values[0][0] == FieldValue.Cross &&
                field.values[1][1] == FieldValue.Cross &&
                field.values[2][2] == FieldValue.Cross) ||
            (field.values[2][0] == FieldValue.Cross &&
                field.values[1][1] == FieldValue.Cross &&
                field.values[0][2] == FieldValue.Cross)
        ) {
            return GameState.Player1Win;
        }
        if (
            (field.values[0][0] == FieldValue.Nought &&
                field.values[1][1] == FieldValue.Nought &&
                field.values[2][2] == FieldValue.Nought) ||
            (field.values[2][0] == FieldValue.Nought &&
                field.values[1][1] == FieldValue.Nought &&
                field.values[0][2] == FieldValue.Nought)
        ) {
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

        return currentState;
    }
}
