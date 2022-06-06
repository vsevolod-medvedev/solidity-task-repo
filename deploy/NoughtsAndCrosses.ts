import { HardhatRuntimeEnvironment } from "hardhat/types"
import type { ContractFactory } from "ethers"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, ethers } = hre

    const { deployer, admin, walletOwner1, walletOwner2, proxyAdminOwner } = await getNamedAccounts()

    var balance = await ethers.provider.getBalance(deployer)
    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    // 1. Get dependencies contracts
    const multiSigWallet = await deployments.get("MultiSigWallet")

    // 2. Deploy/upgrade main contract with proxy
    const noughtsAndCrosses = await deployments.deploy("NoughtsAndCrosses", {
        contract: "NoughtsAndCrosses",
        from: deployer,
        log: true,
        proxy: {
            owner: proxyAdminOwner,
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [multiSigWallet.address, admin],
                },
            },
        },
    })
}

module.exports.tags = ["NoughtsAndCrosses"]
module.exports.dependencies = ["MultiSigWallet"]
