import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareSigners } from "./utils/prepare"
import { advanceTime } from "./utils/time"
import { ecsign } from "ethereumjs-util"

use(waffle.solidity)

describe("NoughtsAndCrosses contract tests", () => {
    beforeEach(async function () {
        await prepareSigners(this)

        this.walletOwner1 = this.misha
        this.walletOwner2 = this.tema

        this.admin = ethers.Wallet.createRandom().connect(ethers.provider)
        await this.carol.sendTransaction({
            to: this.admin.address,
            value: ethers.utils.parseEther("1.0"), // 1.0 ETH
        })

        const MultiSigWalletFactory = await ethers.getContractFactory("MultiSigWallet")
        this.MultiSigWallet = await MultiSigWalletFactory.deploy()
        this.MultiSigWallet.initialize([this.walletOwner1.address, this.walletOwner2.address], 2)

        const NoughtsAndCrossesFactory = await ethers.getContractFactory("NoughtsAndCrosses")
        this.NoughtsAndCrosses = await NoughtsAndCrossesFactory.deploy()
        this.NoughtsAndCrosses.initialize(this.MultiSigWallet.address, this.admin.address)
    })

    describe("As any user, I should be able to", () => {
        it("Create a game", async function () {
            await expect(this.NoughtsAndCrosses.connect(this.bob).createGame(10, { value: 3000 }))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, this.bob.address, ethers.constants.AddressZero, 6)
            expect(await this.NoughtsAndCrosses.connect(this.bob).getGameState(0)).to.equal(
                "Waiting for Player 2 to join"
            )
        })

        it("Join a created game", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10, { value: 3000 })
            await expect(this.NoughtsAndCrosses.connect(this.alice).joinGame(0, { value: 3000 }))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, this.bob.address, this.alice.address, 1)
            expect(await this.NoughtsAndCrosses.connect(this.bob).getGameState(0)).to.equal("Player 1 Turn")
        })

        it("Get a game", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10, { value: 3000 })

            const game = await this.NoughtsAndCrosses.connect(this.carol).getGame(0)

            expect(game.id).to.equal(0)
            expect(game.player1).to.equal(this.bob.address)
            expect(game.timeout).to.equal(10)
            expect(game.bet).to.equal(3000)
            expect(game.state).to.equal(6)
            //expect(game.field).to.equal([[0,0,0], [0,0,0], [0,0,0]])
        })

        it("List games", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10, { value: 3000 })
            await this.NoughtsAndCrosses.connect(this.alice).createGame(15, { value: 5000 })

            const games = await this.NoughtsAndCrosses.connect(this.carol).listCreatedGames()

            expect(games.length).to.equal(2)
            expect(games[0].id).to.equal(0)
            expect(games[0].player1).to.equal(this.bob.address)
            expect(games[0].timeout).to.equal(10)
            expect(games[0].bet).to.equal(3000)
            expect(games[1].id).to.equal(1)
            expect(games[1].player1).to.equal(this.alice.address)
            expect(games[1].timeout).to.equal(15)
            expect(games[1].bet).to.equal(5000)
        })

        it("Change a fee", async function () {
            await this.NoughtsAndCrosses.connect(this.bob).createGame(10, { value: 3000 })

            const newFee = 200
            expect(await this.NoughtsAndCrosses.feeBps()).to.not.equal(newFee)

            const DOMAIN_SEPARATOR = await this.NoughtsAndCrosses.DOMAIN_SEPARATOR()
            const CHANGE_FEE_TYPEHASH = await this.NoughtsAndCrosses.CHANGE_FEE_TYPEHASH()
            const nonce = await this.NoughtsAndCrosses.nonces(this.admin.address)
            const digest = ethers.utils.keccak256(
                ethers.utils.solidityPack(
                    ["bytes2", "bytes32", "bytes32"],
                    [
                        "0x1901",
                        DOMAIN_SEPARATOR,
                        ethers.utils.keccak256(
                            ethers.utils.defaultAbiCoder.encode(
                                ["bytes32", "address", "uint256", "uint256"],
                                [CHANGE_FEE_TYPEHASH, this.admin.address, newFee, nonce]
                            )
                        ),
                    ]
                )
            )
            const { v, r, s } = ecsign(
                Buffer.from(digest.slice(2), "hex"),
                Buffer.from(this.admin.privateKey.slice(2), "hex")
            )
            const r_ = ethers.utils.hexlify(r)
            const s_ = ethers.utils.hexlify(s)

            await expect(this.NoughtsAndCrosses.changeFee(this.bob.address, newFee, v, r_, s_)).to.be.revertedWith(
                "This method can only be called by administrator"
            )

            await this.NoughtsAndCrosses.changeFee(this.admin.address, newFee, v, r_, s_)
            expect(await this.NoughtsAndCrosses.feeBps()).to.equal(newFee)
        })
    })

    describe("Full game scenarios", () => {
        it("Player 1 wins", async function () {
            const player1 = this.bob
            const player2 = this.alice
            //const player1BalanceBefore = await ethers.provider.getBalance(player1.address)
            //const player2BalanceBefore = await ethers.provider.getBalance(player2.address)

            await this.NoughtsAndCrosses.connect(player1).createGame(10, { value: 3000 })
            await this.NoughtsAndCrosses.connect(player2).joinGame(0, { value: 3000 })
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 1, 1)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 1, 2)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 2, 1)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 0, 1)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 2, 0)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 2, 2)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 0, 2)
            await expect(await this.NoughtsAndCrosses.connect(player1).checkGameState(0))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, player1.address, player2.address, 3)
            expect(await this.NoughtsAndCrosses.connect(player1).getGameState(0)).to.equal("Player 1 Win")
            expect(await this.NoughtsAndCrosses.getBalance()).to.equal(6000)

            // Pay prizes and fee
            await expect(await this.NoughtsAndCrosses.connect(player1).getWin(0))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, player1.address, player2.address, 7)
            expect(await this.NoughtsAndCrosses.connect(player1).getGameState(0)).to.equal("Closed")
            expect(await this.NoughtsAndCrosses.getBalance()).to.equal(0)
            expect(await this.MultiSigWallet.getBalance()).to.equal(60)
            //expect(await ethers.provider.getBalance(player1.address)).to.equal(player1BalanceBefore.add(3000 - 60))
            //expect(await ethers.provider.getBalance(player2.address)).to.equal(player2BalanceBefore.sub(3000))

            // Send the game fee from wallet to walletOwner1
            await this.MultiSigWallet.connect(this.walletOwner1).submitTransaction(this.walletOwner1.address, 60, 0)
            await this.MultiSigWallet.connect(this.walletOwner1).confirmTransaction(0)
            await this.MultiSigWallet.connect(this.walletOwner2).confirmTransaction(0)
            await this.MultiSigWallet.connect(this.walletOwner1).executeTransaction(0)
            expect(await this.MultiSigWallet.getBalance()).to.equal(0)
        })

        it("Player 2 wins", async function () {
            const player1 = this.bob
            const player2 = this.alice

            await this.NoughtsAndCrosses.connect(player1).createGame(10, { value: 3000 })
            await this.NoughtsAndCrosses.connect(player2).joinGame(0, { value: 3000 })
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 0, 1)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 2, 2)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 0, 0)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 0, 2)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 1, 1)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 1, 2)
            await expect(await this.NoughtsAndCrosses.connect(player1).checkGameState(0))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, player1.address, player2.address, 4)
            expect(await this.NoughtsAndCrosses.connect(player1).getGameState(0)).to.equal("Player 2 Win")
        })

        it("Draw", async function () {
            const player1 = this.bob
            const player2 = this.alice

            await this.NoughtsAndCrosses.connect(player1).createGame(10, { value: 3000 })
            await this.NoughtsAndCrosses.connect(player2).joinGame(0, { value: 3000 })
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 1, 1)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 2, 1)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 0, 0)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 2, 2)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 2, 0)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 0, 2)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 1, 2)
            await this.NoughtsAndCrosses.connect(player2).makeTurn(0, 1, 0)
            await this.NoughtsAndCrosses.connect(player1).makeTurn(0, 0, 1)
            await expect(await this.NoughtsAndCrosses.connect(player2).checkGameState(0))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, player1.address, player2.address, 0)
            expect(await this.NoughtsAndCrosses.connect(player1).getGameState(0)).to.equal("Draw")
        })

        it("Timeout", async function () {
            const player1 = this.bob
            const player2 = this.alice

            await this.NoughtsAndCrosses.connect(player1).createGame(50, { value: 3000 })
            await this.NoughtsAndCrosses.connect(player2).joinGame(0, { value: 3000 })
            advanceTime(51)
            await expect(this.NoughtsAndCrosses.connect(player1).makeTurn(0, 1, 1)).to.be.revertedWith("Time was out!")
            await expect(await this.NoughtsAndCrosses.connect(player1).checkGameState(0))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, player1.address, player2.address, 5)
            expect(await this.NoughtsAndCrosses.connect(player1).getGameState(0)).to.equal("Player 1 Timeout")
        })

        it("Cancel the game", async function () {
            const player1 = this.bob
            const player2 = this.alice

            await this.NoughtsAndCrosses.connect(player1).createGame(50, { value: 3000 })
            await expect(this.NoughtsAndCrosses.connect(player2).cancelGame(0)).to.be.revertedWith(
                "This method can only be called by the game creator (Player 1)"
            )
            await expect(await this.NoughtsAndCrosses.connect(player1).cancelGame(0))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, player1.address, ethers.constants.AddressZero, 8)
            expect(await this.NoughtsAndCrosses.connect(player1).getGameState(0)).to.equal("Cancelled")

            // Pay prize and fee
            await expect(await this.NoughtsAndCrosses.connect(player1).getWin(0))
                .to.emit(this.NoughtsAndCrosses, "GameStateChanged")
                .withArgs(0, player1.address, ethers.constants.AddressZero, 7)
            expect(await this.NoughtsAndCrosses.connect(player1).getGameState(0)).to.equal("Closed")
            expect(await this.NoughtsAndCrosses.getBalance()).to.equal(0)
            expect(await this.MultiSigWallet.getBalance()).to.equal(30)
        })
    })

    // TODO: Edge cases, permissions etc.
})
