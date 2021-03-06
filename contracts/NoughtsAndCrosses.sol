// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @title Noughts and Crosses classical game (the test task for iLink Academy, 2022)
/// @author Vsevolod Medvedev
/// @notice Player can create or join a game, and once it started, do turns until win, draw or timeout
contract NoughtsAndCrosses is Initializable {
    string public constant NAME = "NoughtsAndCrosses";

    uint256 public feeBps; // In basis points (1 BPS = 0.01%)
    uint256 public minBet;
    uint256 public maxBet;
    address public wallet;
    address public admin;

    bytes32 public CHANGE_FEE_TYPEHASH;
    bytes32 public DOMAIN_SEPARATOR;

    mapping(address => uint256) public nonces;

    enum FieldValue {
        Empty,
        Cross,
        Nought
    }

    enum GameState {
        Draw, // 0
        Player1Turn, // 1
        Player2Turn, // 2
        Player1Win, // 3
        Player2Win, // 4
        Player1Timeout, // 5
        WaitingForPlayer2ToJoin, // 6
        Closed, // 7
        Cancelled, // 8
        Player2Timeout // 9
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
        uint256 bet;
        GameField field;
        GameState state;
    }

    Game[] games;

    event Deposit(address indexed caller, uint256 indexed amount, uint256 balance, string indexed message);
    event GameStateChanged(uint256 indexed id, address indexed player1, address player2, GameState indexed state);

    modifier notTimeout(uint256 _gameId) {
        Game memory game = games[_gameId];
        require(block.timestamp - game.lastTurnTime < game.timeout, "Time was out!");
        _;
    }

    modifier currentPlayerOnly(uint256 _gameId) {
        Game memory game = games[_gameId];
        require(
            (msg.sender == game.player1 && game.state == GameState.Player1Turn) ||
                (msg.sender == game.player2 && game.state == GameState.Player2Turn),
            _concat(
                "Only player whose turn it is now can make a move, current state is: ",
                _getGameStateString(game.state)
            )
        );
        _;
    }

    modifier playerOnly(uint256 _gameId) {
        Game memory game = games[_gameId];
        require(
            (msg.sender == game.player1) || (msg.sender == game.player2),
            "This method can only be called by Player 1 or Player 2"
        );
        _;
    }

    modifier creatorOnly(uint256 _gameId) {
        Game memory game = games[_gameId];
        require(msg.sender == game.player1, "This method can only be called by the game creator (Player 1)");
        _;
    }

    modifier stateIsAnyPlayerTurn(uint256 _gameId) {
        Game memory game = games[_gameId];
        require(
            (game.state == GameState.Player1Turn) || (game.state == GameState.Player2Turn),
            _concat(
                "This method can only be called when any player turn it is now, current state is: ",
                _getGameStateString(game.state)
            )
        );
        _;
    }

    modifier stateIsGameEnded(uint256 _gameId) {
        Game memory game = games[_gameId];
        require(
            (game.state == GameState.Cancelled ||
                game.state == GameState.Player1Win ||
                game.state == GameState.Player2Win ||
                game.state == GameState.Draw ||
                game.state == GameState.Player1Timeout ||
                game.state == GameState.Player2Timeout),
            _concat("The game is not ended, current state is: ", _getGameStateString(game.state))
        );
        _;
    }

    modifier stateOnly(uint256 _gameId, GameState _state) {
        require(games[_gameId].state == _state, "The game is in another state");
        _;
    }

    modifier verifyFeeBps(uint256 _newFeeBps) {
        require(0 <= _newFeeBps && _newFeeBps <= 1000); // from 0% to 10%
        _;
    }

    modifier verifyBetToCreate() {
        require(minBet <= msg.value && msg.value <= maxBet, "Bet to create is out of range");
        _;
    }

    modifier verifyBetToJoin(uint256 _gameId) {
        require(msg.value == games[_gameId].bet, "Bet to join must match the game bet");
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

    function initialize(address _multiSigWallet, address _admin) public initializer {
        wallet = _multiSigWallet;
        feeBps = 100; // In basis points (1 BPS = 0.01%)
        minBet = 1000;
        maxBet = 1000000000000000;
        admin = _admin;

        // EIP712 / EIP-2612 domains and permissions
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(NAME)),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
        CHANGE_FEE_TYPEHASH = keccak256("changeFee(address account,uint256 newFeeBps,uint256 nonce)");
    }

    /// @notice Function to receive Ether. msg.data must be empty
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance, "Received was called");
    }

    /// @notice Fallback function is called when msg.data is not empty
    fallback() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance, "Fallback was called");
    }

    /// @notice Get the contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Change open and future games fee
    /// @param _newFeeBps New fee value in basis points (1 BPS = 0.01%)
    function changeFee(
        address _account,
        uint256 _newFeeBps,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external verifyFeeBps(_newFeeBps) {
        // Note: Here we demonstrate EIP-712 / EIP-2612 signing & verification approach for learning purposes
        // (otherwise it could be implemented just with adminOnly modifier)
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(CHANGE_FEE_TYPEHASH, _account, _newFeeBps, nonces[_account]++))
            )
        );
        address recoveredAddress = ecrecover(digest, _v, _r, _s);
        require(
            recoveredAddress != address(0) && recoveredAddress == admin,
            "This method can only be called by administrator"
        );
        feeBps = _newFeeBps;
    }

    /// @notice Create a Noughts and Crosses game. A caller becomes player1 and waits for player2 to join
    /// @param _timeout Timeout for a turn in seconds
    function createGame(uint256 _timeout) external payable verifyBetToCreate {
        uint256 id = games.length;

        GameField memory field;
        for (uint256 i = 0; i < 3; i++) for (uint256 j = 0; j < 3; j++) field.values[i][j] = FieldValue.Empty;

        Game memory game = Game(
            msg.sender,
            address(0),
            id,
            0,
            _timeout,
            msg.value,
            field,
            GameState.WaitingForPlayer2ToJoin
        );
        games.push(game);

        emit GameStateChanged(game.id, game.player1, game.player2, game.state);
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

    /// @notice Get the game state string
    /// @param _gameId The game ID
    function getGameState(uint256 _gameId) external view returns (string memory) {
        return _getGameStateString(games[_gameId].state);
    }

    function getLastCreatedGameId() external view returns (uint256) {
        return games.length - 1;
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

    /// @notice Cancel the specified game. Only creator (player 1) can call this
    /// @param _gameId Game to cancel
    function cancelGame(uint256 _gameId)
        external
        creatorOnly(_gameId)
        stateOnly(_gameId, GameState.WaitingForPlayer2ToJoin)
    {
        Game storage game = games[_gameId];
        game.state = GameState.Cancelled;

        emit GameStateChanged(game.id, game.player1, game.player2, game.state);
    }

    /// @notice Join the specified game. A caller becomes player2 and waits for player1 to make turn
    /// @param _gameId Game to join
    function joinGame(uint256 _gameId)
        external
        payable
        stateOnly(_gameId, GameState.WaitingForPlayer2ToJoin)
        verifyBetToJoin(_gameId)
    {
        Game storage game = games[_gameId];
        game.player2 = msg.sender;
        game.state = GameState.Player1Turn;
        game.lastTurnTime = block.timestamp;

        emit GameStateChanged(game.id, game.player1, game.player2, game.state);
    }

    /// @notice Make turn. Can only be called by the player whose turn it is now
    function makeTurn(
        uint256 _gameId,
        uint8 _x,
        uint8 _y
    )
        external
        currentPlayerOnly(_gameId)
        notTimeout(_gameId)
        verifyCoordinates(_gameId, _x, _y)
        returns (GameField memory)
    {
        Game storage game = games[_gameId];

        if (msg.sender == game.player1) {
            game.field.values[_y][_x] = FieldValue.Cross;
            game.state = GameState.Player2Turn;
        } else {
            game.field.values[_y][_x] = FieldValue.Nought;
            game.state = GameState.Player1Turn;
        }
        game.lastTurnTime = block.timestamp;

        return game.field;
    }

    function checkGameState(uint256 _gameId)
        external
        stateIsAnyPlayerTurn(_gameId)
        playerOnly(_gameId)
        returns (GameState state)
    {
        Game storage game = games[_gameId];
        GameState savedState = game.state;

        if (block.timestamp - game.lastTurnTime > game.timeout) {
            if (game.state == GameState.Player1Turn) {
                game.state = GameState.Player1Timeout;
            } else {
                game.state = GameState.Player2Timeout;
            }
        } else {
            game.state = _checkTurn(_gameId);
        }

        // Expected new state: Player1Win or Player2Win or Draw or Timeout
        if (game.state != savedState) {
            emit GameStateChanged(game.id, game.player1, game.player2, game.state);
        }

        return game.state;
    }

    /// @notice Get win. Can only be called by the player who won/lost or if the game is ended in a draw/timeout
    function getWin(uint256 _gameId) external stateIsGameEnded(_gameId) playerOnly(_gameId) {
        Game storage game = games[_gameId];

        GameState savedState = game.state;
        game.state = GameState.Closed;

        uint256 game_bet = game.bet;
        if (savedState != GameState.Cancelled) {
            game_bet = game_bet * 2;
        }
        uint256 fee = (game_bet * feeBps) / 10000;
        uint256 prize = game_bet - fee;

        // Send fee to Multi-Sig Wallet
        bool sent;
        (sent, ) = payable(wallet).call{value: fee}("");
        require(sent, "Failed to send fee to wallet");

        // Send prize to players
        if (
            savedState == GameState.Cancelled ||
            savedState == GameState.Player1Win ||
            savedState == GameState.Player2Timeout
        ) {
            (sent, ) = payable(game.player1).call{value: prize}("");
            require(sent, "Failed to send prize to Player 1");
        } else if (savedState == GameState.Player2Win || savedState == GameState.Player1Timeout) {
            (sent, ) = payable(game.player2).call{value: prize}("");
            require(sent, "Failed to send prize to Player 2");
        } else if (savedState == GameState.Draw) {
            uint256 prize_half1 = prize / 2;
            uint256 prize_half2 = prize - prize_half1;
            (bool sent1, ) = payable(game.player1).call{value: prize_half1}("");
            (bool sent2, ) = payable(game.player2).call{value: prize_half2}("");
            require(sent1 && sent2, "Failed to send prizes to players");
        }

        emit GameStateChanged(game.id, game.player1, game.player2, game.state);
    }

    /// @notice Get stats
    function getStats() external {
        // TODO
    }

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

    function _concat(string memory _a, string memory _b) internal pure returns (string memory) {
        return string(abi.encodePacked(_a, _b));
    }

    function _getGameStateString(GameState _state) internal pure returns (string memory) {
        string[10] memory stateStrings = [
            "Draw",
            "Player 1 Turn",
            "Player 2 Turn",
            "Player 1 Win",
            "Player 2 Win",
            "Player 1 Timeout",
            "Waiting for Player 2 to join",
            "Closed",
            "Cancelled",
            "Player 2 Timeout"
        ];
        return stateStrings[uint256(_state)];
    }
}
