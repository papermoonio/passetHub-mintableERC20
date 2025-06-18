import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

const MintableERC20Module = buildModule("MintableERC20Module", (m) => {
  const name = m.getParameter("name", "name")

  const symbol = m.getParameter("symbol", "symbol")

  console.log(name, symbol)

  const token = m.contract("MintableERC20", [name, symbol])

  return { token }
})

export default MintableERC20Module
