```bash
# Run only TaskRepo tests
npx hardhat test tests/TaskRepo.test.ts

# Run local network
npx hardhat node

# Run tasks in local network
npx hardhat create-task --estimated-time 10 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat create-task --estimated-time 150 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat create-task --estimated-time 30 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat create-task --estimated-time 100 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat list-tasks --network localhost
npx hardhat get-task --id 0 --network localhost
npx hardhat complete-task --id 0 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat delete-task --id 0 --network localhost


npx hardhat list-games --network localhost
npx hardhat get-game --id 0 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat get-game-field --id 0 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost

npx hardhat create-game --timeout 10 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
npx hardhat join-game --id 0 --account 0x09934701f5c76250feafee70bca144ebf97b0a02 --network localhost
npx hardhat make-turn --id 0 --x 1 --y 1 --account 0x590928e30103457a584465e31DF5CCd97109ACe8 --network localhost
```
