import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    console.log(`ChainId: ${await hre.getChainId()}`)

    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer, _, walletOwner1, walletOwner2, proxyAdminOwner } = await getNamedAccounts()
    const balance = await ethers.provider.getBalance(deployer)

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
}

module.exports.tags = ["MultiSigWallet"]
