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

task("list-games", "List created games").setAction(async (taskArgs, hre) => {
    const noughtsAndCrosses = await hre.ethers.getContractAt("NoughtsAndCrosses", NoughtsAndCrossesAddress)

    console.log(await noughtsAndCrosses.listCreatedGames())
})
