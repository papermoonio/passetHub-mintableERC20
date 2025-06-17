import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@parity/hardhat-polkadot';
import { config as dotConfig } from "dotenv";
dotConfig();

if (!process.env.PRIVATE_KEY) {
    throw new Error("Please set your PRIVATE_KEY in a .env file");
}

const config: HardhatUserConfig = {
    solidity: '0.8.28',
    resolc: {
        compilerSource: 'npm',
    },
    networks: {
        hardhat: {
            polkavm: true,
            forking: {
                url: 'wss://westend-asset-hub-rpc.polkadot.io',
            },
            adapterConfig: {
                adapterBinaryPath: './bin/eth-rpc',
                dev: true,
            },
        },
        passetHub: {
            polkavm: true,
            url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
            accounts: [process.env.PRIVATE_KEY],
        },
        local: {
            polkavm: true,
            url: "http://localhost:8545",
            accounts: [process.env.LOCAL_PRIV_KEY ?? "", process.env.LOCAL_PRIV_KEY_2 ?? ""],
        },
    }
};

export default config;
