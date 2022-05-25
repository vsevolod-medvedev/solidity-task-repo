import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer, _, walletOwner1, walletOwner2 } = await getNamedAccounts()

    var balance = await ethers.provider.getBalance(deployer)
    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    const multiSigWallet = await deploy("MultiSigWallet", {
        from: deployer,
        log: true,
        args: [[walletOwner1, walletOwner2], 2],
    })

    balance = await ethers.provider.getBalance(deployer)
    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    await deploy("NoughtsAndCrosses", { from: deployer, log: true, args: [multiSigWallet.address] })
}

module.exports.tags = ["NoughtsAndCrosses"]
