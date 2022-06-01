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
npx hardhat run deploy/NoughtsAndCrosses.ts --network rinkeby
# or
npx hardhat deploy --network rinkeby
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

```
npx hardhat upgrade-game --proxy 0xEF443E6e35c20686ff1D1666580C5A47274b7802 --network localhost

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
