# solidity-task-repo

Test task for iLink 2022.

## Installation

```bash
$ nvm use
$ npm install
$ npx hardhat mnemonic  # use it in .env
```

## Development

### Creating smart contract

Create your smart contract in `contracts/` folder

### Compilation

Set solidity version in hardhat.config.ts file, solidity -> compilers -> version, then run compilation

```bash
$ npx hardhat compile
```

### Running tests

Create your tests in test folder. To set typed test, describe types in `test.config.d.ts`. Then, use it with Mocha.Context (this)

Run tests with command:

```bash
# All tests:
$ npx hardhat test

# Specific tests:
$ npx hardhat test tests/TaskRepo.test.ts
```

Run tests and calculate gasPrice with command:

```bash
$ REPORT_GAS=true npx hardhat test
```

### Running tasks

```bash
npx hardhat node  # for running locally
npx hardhat accounts

npx hardhat create-task --estimated-time 50 --account <address> --network <network>
npx hardhat get-task --id <task_id> --account <address> --network <network>
npx hardhat list-tasks --network <network>
npx hardhat delete-task --id <task_id> --account <address> --network <network>
npx hardhat complete-task --id <task_id> --account <address> --network <network>
```

### Deploy

Run deploy in hardhat network

```bash
$ npx hardhat deploy
```

Run deploy in ropsten network

```bash
$ npm run deploy:ropsten
```

Run deploy in ropsten network for new contract

```bash
$ npm run deploy:ropsten:new
```

### Verification contract

Run verify in ropsten network

```bash
$ npm run verify:ropsten
```

## Useful links

1. Hardhat documentation:
   https://hardhat.org/getting-started/
2. Style Guide:
   https://docs.soliditylang.org/en/v0.8.13/style-guide.html#style-guide
3. Common Patterns:
   https://docs.soliditylang.org/en/v0.8.13/common-patterns.html
4. Security Considerations:
   https://docs.soliditylang.org/en/v0.8.13/security-considerations.html#security-considerations
