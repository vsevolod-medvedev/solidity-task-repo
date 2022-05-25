import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer, _, walletOwner1, walletOwner2 } = await getNamedAccounts()
    const balance = await ethers.provider.getBalance(deployer)

    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)
    console.log(`WalletOwner1: ${walletOwner1} , balance: ${ethers.utils.formatEther(balance)} `)
    console.log(`WalletOwner2: ${walletOwner2} , balance: ${ethers.utils.formatEther(balance)} `)

    await deploy("MultiSigWallet", { from: deployer, log: true, args: [[walletOwner1, walletOwner2], 2] })
}

module.exports.tags = ["MultiSigWallet"]
