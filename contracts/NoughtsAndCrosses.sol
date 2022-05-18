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
        uint256 lastTurnTime;
        uint256 timeout;
        GameField field;
        GameState state;
    }

    Game[] games;

    event GameCreated(uint256 indexed id, address indexed player1, uint256 indexed timeout);
    event GameStarted(uint256 indexed id, address indexed player1, address indexed player2);
    event GameFinished(uint256 indexed id, address indexed player1, address indexed player2, GameState state);

    modifier currentPlayerOnly(uint256 _gameId) {
        Game memory game = games[_gameId];
        require(
            (msg.sender == game.player1 && game.state == GameState.Player1Turn) ||
                (msg.sender == game.player2 && game.state == GameState.Player2Turn),
            "Only player whose turn it is now can make a move"
        );
        _;
    }

    modifier stateOnly(uint256 _gameId, GameState _state) {
        require(games[_gameId].state == _state, "The game is in another state");
        _;
    }

    modifier verifyCoordinates(
        uint256 _gameId,
        uint8 _x,
        uint8 _y
    ) {
        require(_x >= 0 && _x <= 2 && _y >= 0 && _y <= 2, "Coordinates are out of range");
        require(games[_gameId].field.values[_y][_x] == FieldValue.Empty, "The cell is already filled");
        _;
    }

    /// @notice Create a Noughts and Crosses game. A caller becomes player1 and waits for player2 to join
    /// @param _timeout Timeout for a turn in seconds
    function createGame(uint256 _timeout) external {
        uint256 id = games.length;

        GameField memory field;
        for (uint256 i = 0; i < 3; i++) for (uint256 j = 0; j < 3; j++) field.values[i][j] = FieldValue.Empty;

        Game memory game = Game(msg.sender, address(0), id, 0, _timeout, field, GameState.WaitingForPlayer2ToJoin);
        games.push(game);

        emit GameCreated(game.id, game.player1, game.timeout);
    }

    /// @notice Get the game
    /// @param _gameId The game ID
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    /// @notice Get the game field
    /// @param _gameId The game ID
    function getGameField(uint256 _gameId) external view returns (GameField memory) {
        return games[_gameId].field;
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
    function joinGame(uint256 _gameId) external stateOnly(_gameId, GameState.WaitingForPlayer2ToJoin) {
        Game storage game = games[_gameId];
        game.player2 = msg.sender;
        game.state = GameState.Player1Turn;
        game.lastTurnTime = block.timestamp;
        emit GameStarted(game.id, game.player1, game.player2);
    }

    /// @notice Make turn. Can only be called by the player whose turn it is now
    function makeTurn(
        uint256 _gameId,
        uint8 _x,
        uint8 _y
    ) external currentPlayerOnly(_gameId) verifyCoordinates(_gameId, _x, _y) returns (GameField memory, GameState) {
        Game storage game = games[_gameId];

        // Check timeout
        if (block.timestamp - game.lastTurnTime > game.timeout) {
            game.state = GameState.Timeout;
        }
        // Fill in a cell
        else {
            if (msg.sender == game.player1) {
                game.field.values[_y][_x] = FieldValue.Cross;
                game.state = GameState.Player2Turn;
            } else {
                game.field.values[_y][_x] = FieldValue.Nought;
                game.state = GameState.Player1Turn;
            }
            game.lastTurnTime = block.timestamp;
            game.state = _checkTurn(_gameId);
        }

        if (
            game.state == GameState.Player1Win ||
            game.state == GameState.Player2Win ||
            game.state == GameState.Draw ||
            game.state == GameState.Timeout
        ) {
            emit GameFinished(game.id, game.player1, game.player2, game.state);
        }

        return (game.field, game.state);
    }

    /// @notice Get win. Can only be called by the player who won.
    function getWin() external {}

    function _checkTurn(uint256 _gameId) private view returns (GameState) {
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
