import { task } from "hardhat/config"

const NoughtsAndCrossesAddress = "0xCe3b823FcDdfC3E56e6d602997B5348aB94Cf8F1"

task("create-game", "Create a game")
    .addParam("account", "The account's address")
    .addParam("timeout", "Timeout for a turn, in seconds")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        await noughtsAndCrosses.connect(signer).createGame(taskArgs.timeout)
        console.log("Game created!")
    })

task("get-game-field", "Get game field")
    .addParam("account", "The account's address")
    .addParam("id", "The game ID")
    .setAction(async (taskArgs, hre) => {
        const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)
        const signer = await hre.ethers.getSigner(taskArgs.account)

        console.log(await noughtsAndCrosses.connect(signer).getGameField(taskArgs.id))
    })

task("list-games", "List created games").setAction(async (taskArgs, hre) => {
    const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)

    const games = await noughtsAndCrosses.listCreatedGames()
    console.log(games)
    //    games.forEach(game => console.log(game.timeout))
})
