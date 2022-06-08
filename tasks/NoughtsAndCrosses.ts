import { task } from "hardhat/config"
import { ecsign } from "ethereumjs-util"

const NoughtsAndCrossesAddress = "0xEF443E6e35c20686ff1D1666580C5A47274b7802" // proxy!

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

task("cancel-game", "Cancel the created game if Player 2 has not joined yet")
    .addParam("account", "The account's address")
    .addParam("id", "The game ID")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await noughtsAndCrosses.connect(signer).cancelGame(taskArgs.id)
        console.log("Cancelled the game!")
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

task("change-fee", "Change open and future games fee")
    .addParam("account", "The account's address")
    .addParam("privateKey", "The account's private key")
    .addParam("fee", "New fee in base points (1 BPS = 0.01%)")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const newFee = taskArgs.fee
        const signer = await hre.ethers.getSigner(taskArgs.account)
        const DOMAIN_SEPARATOR = await noughtsAndCrosses.DOMAIN_SEPARATOR()
        const CHANGE_FEE_TYPEHASH = await noughtsAndCrosses.CHANGE_FEE_TYPEHASH()
        const nonce = await noughtsAndCrosses.nonces(signer.address)
        const digest = hre.ethers.utils.keccak256(
            hre.ethers.utils.solidityPack(
                ["bytes2", "bytes32", "bytes32"],
                [
                    "0x1901",
                    DOMAIN_SEPARATOR,
                    hre.ethers.utils.keccak256(
                        hre.ethers.utils.defaultAbiCoder.encode(
                            ["bytes32", "address", "uint256", "uint256"],
                            [CHANGE_FEE_TYPEHASH, signer.address, newFee, nonce]
                        )
                    ),
                ]
            )
        )
        const { v, r, s } = ecsign(
            Buffer.from(digest.slice(2), "hex"),
            Buffer.from(taskArgs.privateKey.slice(2), "hex")
        )
        const r_ = hre.ethers.utils.hexlify(r)
        const s_ = hre.ethers.utils.hexlify(s)

        await noughtsAndCrosses.connect(signer).changeFee(newFee, v, r_, s_)
    })
