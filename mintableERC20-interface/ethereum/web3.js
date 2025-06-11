const ethers = require("ethers");

const web3 = () => {
  if (typeof ethereum !== "undefined" && ethereum.chainId === "0x190f1b45") {
    // We are in the browser and MetaMask is running
    return new ethers.providers.Web3Provider(ethereum);
  } else {
    // We are on the server *OR* the user is not running metamask
    return new ethers.providers.StaticJsonRpcProvider(
      "https://testnet-passet-hub-eth-rpc.polkadot.io",
      {
        chainId: 420420421,
        name: "passet-hub",
      }
    );
  }
};

export default web3;
