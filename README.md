# solidity-task-repo

Test task for iLink 2022.

Includes:

- **NoughtsAndCrosses** game;
- **TaskRepo** CRUD application.

## Installation

```bash
$ nvm use
$ npm install
$ npx hardhat mnemonic  # use it in .env
$ npx hardhat keys  # show keys
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

All tests:

```bash
$ npx hardhat test
```

Specific tests:

```bash
$ npx hardhat test tests/NoughtsAndCrosses.test.ts
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
```

#### NoughtsAndCrosses tasks

```bash
npx hardhat create-game --timeout 50 --account <address> --network <network>
npx hardhat get-game --id <game_id> --network <network>
npx hardhat list-games --network <network>
npx hardhat join-game --id <game_id> --account <address> --network <network>
npx hardhat make-turn --id <game_id> --x <x_coord> --y <y_coord> --account <address> --network <network>
npx hardhat check-game-state --id <game_id> --account <address> --network <network>
npx hardhat get-win --id <game_id> --account <address> --network <network>
npx hardhat quick-game --player1 <address> --player2 <address> --timeout 5 --bet 1000 --network <network>
npx hardhat change-fee --account <address> --privateKey <address> --timeout 5 --bet 1000 --network <network>
```

#### TaskRepo tasks

```bash
npx hardhat create-task --estimated-time 50 --account <address> --network <network>
npx hardhat get-task --id <task_id> --account <address> --network <network>
npx hardhat list-tasks --network <network>
npx hardhat delete-task --id <task_id> --account <address> --network <network>
npx hardhat complete-task --id <task_id> --account <address> --network <network>
```

### Deploy

Run deploy in hardhat network

```bash
npx hardhat deploy
```

Deploy/upgrade specific contracts with dependencies by tags:

```bash
npx hardhat deploy --tags NoughtsAndCrosses --network ropsten
```

Run deploy all contracts in ropsten network

```bash
npm run deploy:ropsten
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
5. Solidity by Example:
   https://solidity-by-example.org/sending-ether
6. Proxy Upgrade Pattern:
   https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies
7. Deploying and Upgrading Proxies:
   https://github.com/wighawag/hardhat-deploy#deploying-and-upgrading-proxies
8. EIP-712: Ethereum typed structured data hashing and signing:
   https://eips.ethereum.org/EIPS/eip-712
9. EIP-2612: permit ??? 712-signed approvals:
   https://eips.ethereum.org/EIPS/eip-2612
