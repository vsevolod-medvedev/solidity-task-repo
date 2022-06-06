import { task } from "hardhat/config"

task("mnemonic", "Generate new mnemonic", async (taskArgs, hre) => {
    const wallet = hre.ethers.Wallet.createRandom()
    console.log(`Mnemonic: ${wallet.mnemonic.phrase}`)
})

task("keys", "Shows public and private key for mnemonic").setAction(async (taskArgs, hre) => {
    //let mnemonic = process.env.MNEMONIC
    let mnemonic = "Enter your mnemonic here"
    let mnemonicWallet = hre.ethers.Wallet.fromMnemonic(mnemonic)
    console.log(`Mnemonic: ${mnemonicWallet.mnemonic}`)
    console.log(`Address: ${mnemonicWallet.address}`)
    console.log(`Public key: ${mnemonicWallet.publicKey}`)
    console.log(`Private key: ${mnemonicWallet.privateKey}`)
})
