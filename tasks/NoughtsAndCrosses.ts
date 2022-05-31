import { task } from "hardhat/config"

const NoughtsAndCrossesAddress = "0xCe3b823FcDdfC3E56e6d602997B5348aB94Cf8F1"

task("create-game", "Create a game")
    .addParam("account", "The account's address")
    .addParam("timeout", "Timeout for a turn, in seconds")
    .addParam("bet", "The game bet, in Wei")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await noughtsAndCrosses.connect(signer).createGame(taskArgs.timeout, { value: taskArgs.bet })
        console.log("Game created!")
    })

task("get-game", "Get game")
    .addParam("account", "The account's address")
    .addParam("id", "The game ID")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        console.log(await noughtsAndCrosses.connect(signer).getGame(taskArgs.id))
    })

task("list-games", "List created games").setAction(async (taskArgs, hre) => {
    const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)

    const games = await noughtsAndCrosses.listCreatedGames()
    console.log(games)
})

task("join-game", "Join the game")
    .addParam("account", "The account's address")
    .addParam("id", "The game ID")
    .addParam("bet", "The game bet, in Wei")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await noughtsAndCrosses.connect(signer).joinGame(taskArgs.id, { value: taskArgs.bet })
        console.log("Joined the game. Game started!")
    })

task("make-turn", "Make turn")
    .addParam("account", "The account's address")
    .addParam("id", "The game ID")
    .addParam("x", "X coordinate")
    .addParam("y", "Y coordinate")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await noughtsAndCrosses.connect(signer).makeTurn(taskArgs.id, taskArgs.x, taskArgs.y)
        console.log(await noughtsAndCrosses.connect(signer).getGameField(taskArgs.id))

        //        await noughtsAndCrosses.connect(signer).checkGameState(taskArgs.id)
        //        console.log(await noughtsAndCrosses.connect(signer).getGameState(taskArgs.id))
    })

task("check-game-state", "Check the game state")
    .addParam("account", "The account's address")
    .addParam("id", "The game ID")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await noughtsAndCrosses.connect(signer).checkGameState(taskArgs.id)
        console.log(await noughtsAndCrosses.connect(signer).getGameState(taskArgs.id))
    })

task("get-win", "Get win")
    .addParam("account", "The account's address")
    .addParam("id", "The game ID")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await noughtsAndCrosses.connect(signer).getWin(taskArgs.id)
        console.log(await noughtsAndCrosses.connect(signer).getGameState(taskArgs.id))
    })

task("quick-game", "Run quick game")
    .addParam("player1", "The Player 1 address")
    .addParam("player2", "The Player 2 address")
    .addParam("timeout", "Timeout for a turn, in seconds")
    .addParam("bet", "The game bet, in Wei")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const player1 = await hre.ethers.getSigner(taskArgs.player1)
        const player2 = await hre.ethers.getSigner(taskArgs.player2)

        await noughtsAndCrosses.connect(player1).createGame(taskArgs.timeout, { value: taskArgs.bet })
        const gameId = await noughtsAndCrosses.getLastCreatedGameId()
        console.log(`Game ID: ${gameId}`)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))

        await noughtsAndCrosses.connect(player2).joinGame(gameId, { value: taskArgs.bet })
        console.log(await noughtsAndCrosses.connect(player2).getGameState(gameId))

        await noughtsAndCrosses.connect(player1).makeTurn(gameId, 1, 1)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))
        await noughtsAndCrosses.connect(player2).makeTurn(gameId, 1, 2)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))
        await noughtsAndCrosses.connect(player1).makeTurn(gameId, 2, 1)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))
        await noughtsAndCrosses.connect(player2).makeTurn(gameId, 0, 1)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))
        await noughtsAndCrosses.connect(player1).makeTurn(gameId, 2, 0)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))
        await noughtsAndCrosses.connect(player2).makeTurn(gameId, 2, 2)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))
        await noughtsAndCrosses.connect(player1).makeTurn(gameId, 0, 2)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))

        await noughtsAndCrosses.connect(player1).checkGameState(gameId)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))

        await noughtsAndCrosses.connect(player1).getWin(gameId)
        console.log(await noughtsAndCrosses.connect(player1).getGameState(gameId))

        console.log(await noughtsAndCrosses.connect(player1).getGameField(gameId))
    })
