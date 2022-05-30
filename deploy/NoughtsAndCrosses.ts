import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer, _, walletOwner1, walletOwner2, proxyAdminOwner } = await getNamedAccounts()

    var balance = await ethers.provider.getBalance(deployer)
    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    const multiSigWallet = await deploy("MultiSigWallet", {
        contract: "MultiSigWallet",
        from: deployer,
        log: true,
        proxy: {
            owner: proxyAdminOwner,
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [[walletOwner1, walletOwner2], 2],
                },
            },
        },
    })

    balance = await ethers.provider.getBalance(deployer)
    console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

    await deploy("NoughtsAndCrosses", {
        contract: "NoughtsAndCrosses",
        from: deployer,
        log: true,
        proxy: {
            owner: proxyAdminOwner,
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [multiSigWallet.address],
                },
            },
        },
    })
}

module.exports.tags = ["NoughtsAndCrosses"]
