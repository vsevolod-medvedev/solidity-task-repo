## Run specific tests

```bash
npx hardhat test tests/TaskRepo.test.ts
npx hardhat test tests/NoughtsAndCrosses.test.ts
```

## Run local network

```
npx hardhat node
```

## Deploy

```bash
npx hardhat deploy --tags NoughtsAndCrosses --network ropsten
```

Verify:

```bash
npx hardhat verify <contractAddress> --network ropsten
```

## Run tasks in local network

### TaskRepo

```
npx hardhat create-task --estimated-time 10 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat create-task --estimated-time 150 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat create-task --estimated-time 30 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat create-task --estimated-time 100 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat list-tasks --network localhost
npx hardhat get-task --id 0 --network localhost
npx hardhat complete-task --id 0 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat delete-task --id 0 --network localhost
```

### NaughtsAndCrosses game

Note: Don't forget to set `NoughtsAndCrossesAddress` in `tasks/NoughtsAndCrosses.ts`!

```
npx hardhat quick-game --player1 0x590928e30103457a584465e31DF5CCd97109ACe8 --player2 0x09934701f5c76250feafee70bca144ebf97b0a02 --timeout 5 --bet 1000 --network localhost

npx hardhat list-games --network localhost
npx hardhat get-game --id 0 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost

npx hardhat create-game --timeout 30 --bet 2000 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat join-game --id 0 --bet 2000 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat make-turn --id 0 --x 1 --y 1 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat make-turn --id 0 --x 1 --y 2 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat make-turn --id 0 --x 2 --y 1 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat make-turn --id 0 --x 0 --y 1 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat make-turn --id 0 --x 2 --y 0 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat make-turn --id 0 --x 2 --y 2 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat make-turn --id 0 --x 0 --y 2 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat check-game-state --id 0 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat get-win --id 0 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
```

### Testnet deployments

```
> npx hardhat deploy --tags NoughtsAndCrosses --network ropsten
Generating typings for: 4 artifacts in dir: ./build/typechain for target: ethers-v5
Successfully generated 7 typings!
Compiled 4 Solidity files successfully
ChainId: 3
Deployer: 0xd4Ec05E95b72E616E77E83Cc157D17AeaF296b85 , balance: 10.5
deploying "DefaultProxyAdmin" (tx: 0x1f05a3e768b881c0a35c855ca0639e8ec1ccd5c3c0d0a82d06302098875dd76d)...: deployed at 0x104790B0A9691f41212F30Df9717B79bD161019A with 643983 gas
deploying "MultiSigWallet_Implementation" (tx: 0xc7308b568fdb7b3ced94de09b5abbf73ede0b1937adc3a5e77d982fa43d46e14)...: deployed at 0xCe3b823FcDdfC3E56e6d602997B5348aB94Cf8F1 with 1207730 gas
deploying "MultiSigWallet_Proxy" (tx: 0x38f582cb13d91564bd83b3b4f8d729964f80dd58a4b5e09572f4c738b76b283f)...: deployed at 0xE5F70d2dBC9228ea1010F385c5b7C4e8Ec2E7f1d with 881354 gas
ChainId: 3
Deployer: 0xd4Ec05E95b72E616E77E83Cc157D17AeaF296b85 , balance: 10.312184637987661044
reusing "DefaultProxyAdmin" at 0x104790B0A9691f41212F30Df9717B79bD161019A
deploying "NoughtsAndCrosses_Implementation" (tx: 0x48641220c3f57b2ffbcf3cb3dddb1dc41f0e415f31ae7ac05d32e9f76c1f7742)...: deployed at 0x035522B4eF02A671652093BE08DFF09A9dB95D05 with 2749895 gas
deploying "NoughtsAndCrosses_Proxy" (tx: 0xde2d5c5d59e2bb7391bec270a1ff8dc5cd8bbd63007c629e1e844f8b27f23549)...: deployed at 0xd8E4F47Fb7499B097fA3B302d1c748F1f3df18B8 with 833608 gas
```
