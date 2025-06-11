# Sample Polkadot Hardhat Project

This project demonstrates how to use Hardhat with Polkadot. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

1. Create a binary of the [`eth-rpc-adapter`](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/revive/rpc) and move it to `bin` folder at the root of your project. Alternatively, update your configuration file's `adapterConfig.adapterBinaryPath` to point to your local binary. For instructions, check [Polkadot Hardhat docs](https://papermoonio.github.io/polkadot-mkdocs/develop/smart-contracts/dev-environments/hardhat/#testing-your-contract).

2. Try running some of the following tasks:

```shell
npx hardhat test
npx hardhat compile
```

3. follow the hardhat.config.ts, set the private key in .env

4. deploy contract to passet hub, set the name and symbol in parameters.json file

```shell
echo y | npx hardhat ignition deploy ./ignition/modules/MintableERC20.ts --network passetHub --parameters ./parameters.json

```
