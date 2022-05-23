import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareSigners } from "./utils/prepare"
import { advanceTime } from "./utils/time"

use(waffle.solidity)

describe("NoughtsAndCrosses contract tests", () => {
    beforeEach(async function () {
        const NoughtsAndCrossesFactory = await ethers.getContractFactory("NoughtsAndCrosses")
        this.NoughtsAndCrosses = await NoughtsAndCrossesFactory.deploy()
        await this.NoughtsAndCrosses.deployed()

        await prepareSigners(this)

        this.timestamp = (await ethers.provider.getBlock("latest")).timestamp
    })

    describe("As any user, I should be able to", () => {
        it("Create a game", async function () {
            await expect(this.NoughtsAndCrosses.connect(this.bob).createGame(10))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, this.bob.address, "0x0000000000000000000000000000000000000000", 6)
            expect(await this.NoughtsAndCrosses.connect(this.bob).getGameState(0)).to.equal(
                "Waiting for Player 2 to join"
            )
        })

        it("Join a created game", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10)
            await expect(this.NoughtsAndCrosses.connect(this.alice).joinGame(0))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, this.bob.address, this.alice.address, 1)
            expect(await this.NoughtsAndCrosses.connect(this.bob).getGameState(0)).to.equal("Player 1 Turn")
        })

        it("Get a game", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10)

            const game = await this.NoughtsAndCrosses.connect(this.carol).getGame(0)

            expect(game.id).to.equal(0)
            expect(game.player1).to.equal(this.bob.address)
            expect(game.timeout).to.equal(10)
            expect(game.state).to.equal(6)
            //expect(game.field).to.equal([[0,0,0], [0,0,0], [0,0,0]])
        })

        it("List games", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10)
            await this.NoughtsAndCrosses.connect(this.alice).createGame(15)

            const games = await this.NoughtsAndCrosses.connect(this.carol).listCreatedGames()

            expect(games.length).to.equal(2)
            expect(games[0].id).to.equal(0)
            expect(games[0].player1).to.equal(this.bob.address)
            expect(games[0].timeout).to.equal(10)
            expect(games[1].id).to.equal(1)
            expect(games[1].player1).to.equal(this.alice.address)
            expect(games[1].timeout).to.equal(15)
        })
    })

    describe("Full game scenarios", () => {
        it("Player 1 wins", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10)
            await this.NoughtsAndCrosses.connect(this.alice).joinGame(0)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 1, 1)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 1, 2)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 2, 1)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 0, 1)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 2, 0)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 2, 2)
            await expect(await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 0, 2))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, this.bob.address, this.alice.address, 3)
            expect(await this.NoughtsAndCrosses.connect(this.bob).getGameState(0)).to.equal("Player 1 Win")
        })

        it("Player 2 wins", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10)
            await this.NoughtsAndCrosses.connect(this.alice).joinGame(0)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 0, 1)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 2, 2)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 0, 0)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 0, 2)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 1, 1)
            await expect(await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 1, 2))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, this.bob.address, this.alice.address, 4)
            expect(await this.NoughtsAndCrosses.connect(this.bob).getGameState(0)).to.equal("Player 2 Win")
        })

        it("Draw", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10)
            await this.NoughtsAndCrosses.connect(this.alice).joinGame(0)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 1, 1)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 2, 1)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 0, 0)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 2, 2)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 2, 0)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 0, 2)
            await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 1, 2)
            await this.NoughtsAndCrosses.connect(this.alice).makeTurn(0, 1, 0)
            await expect(await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 0, 1))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, this.bob.address, this.alice.address, 0)
            expect(await this.NoughtsAndCrosses.connect(this.bob).getGameState(0)).to.equal("Draw")
        })

        it("Timeout", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(50)
            await this.NoughtsAndCrosses.connect(this.alice).joinGame(0)
            advanceTime(51)
            await expect(await this.NoughtsAndCrosses.connect(this.bob).makeTurn(0, 1, 1))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, this.bob.address, this.alice.address, 5)
            expect(await this.NoughtsAndCrosses.connect(this.bob).getGameState(0)).to.equal("Timeout")
        })
    })

    // TODO: Edge cases, permissions etc.
})
