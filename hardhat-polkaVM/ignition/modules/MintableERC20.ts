// ignition/modules/MintableERC20.ts

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ContractOptions, Future } from "@nomicfoundation/ignition-core";

const tokens = [
  { name: "Alpha Token", symbol: "ALPHA" },
  // { name: "Beta Token", symbol: "BETA" },
  // { name: "Gamma Token", symbol: "GAMMA" },
  // { name: "Delta Token", symbol: "DELTA" },
  // { name: "Epsilon Token", symbol: "EPS" },
  // { name: "Zeta Token", symbol: "ZETA" },
];

const MintableERC20MultiModule = buildModule(
  "MintableERC20MultiModule",
  (m) => {
    const deployments: { [symbol: string]: Future } = {};

    // This will hold the future of the previously deployed contract.
    let previousTokenDeployment: Future | undefined = undefined;

    for (const tokenInfo of tokens) {
      const { name, symbol } = tokenInfo;

      // Base options for the contract call, including the unique ID.
      const options: ContractOptions = {
        id: `MintableERC20_${symbol}`,
      };

      // If this is not the first token, add a dependency on the previous one.
      // This forces Ignition to wait for the previous deployment to complete.
      if (previousTokenDeployment !== undefined) {
        options.after = [previousTokenDeployment];
      }

      const token = m.contract("MintableERC20", [name, symbol], options);

      // Update the 'previous' deployment to the one we just defined for the next loop iteration.
      previousTokenDeployment = token;

      deployments[symbol] = token;
    }

    return deployments;
  }
);

export default MintableERC20MultiModule;
