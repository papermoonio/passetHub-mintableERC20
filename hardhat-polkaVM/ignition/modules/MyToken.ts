// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

const MyTokenModule = buildModule("MyTokenModule", (m) => {
    const params = m.getParameter("parameters");
    const initialSupply = m.getParameter("parameters", 1_000_000n * 10n ** 18n)

    const token = m.contract("MyToken", [initialSupply])

    return { token }
})

export default MyTokenModule
