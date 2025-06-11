import { ethers } from "ethers"
import { abi } from "./artifacts-pvm/contracts/MintableERC20.sol/MintableERC20.json"
import { config } from "dotenv"
async function main() {
    config()
    const contractAddress = "0x0E14b29Af3B4773d4C159170B0741c3416DC55Cc"
    const url = "https://testnet-passet-hub-eth-rpc.polkadot.io"
    const provider = new ethers.JsonRpcProvider(url)
    const privateKey: string = process.env.PRIV_KEY ??
        "0x1234567890123456789012345678901234567890123456789012345678901234";
    console.log(privateKey)
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(contractAddress)
    const contract = new ethers.Contract(contractAddress, abi, wallet)
    const name = await contract.name()
    const symbol = await contract.symbol()
    console.log("hello", balance, name, symbol)
}

main()

