import React, { useState, useEffect } from "react";
import { Button, Form, Table, Container } from "semantic-ui-react";
import { tokenNames } from "../ethereum/tokenNames";
import tokenInstance from "../ethereum/feed";

const addresses = require("../ethereum/addresses");

const DataFeed = ({ account }) => {
  // State for token data, keyed by token address for efficient lookup.
  const [tokenData, setTokenData] = useState({});
  // State for loading indicators, keyed by token address.
  const [loadingStates, setLoadingStates] = useState({});

  // Fetches balance and minting details for a single token.
  // Now returns the address to be used as a key.
  const getBalance = async (address) => {
    try {
      if (account?.slice(0, 2) === "0x") {
        const contractInstance = tokenInstance(address);
        const [dec, mint, interval, lastMint, balance] = await Promise.all([
          contractInstance.decimals(),
          contractInstance.canMint(account),
          contractInstance.interval(),
          contractInstance.lastMintTime(account),
          contractInstance.balanceOf(account)
        ]);

        const timeLeft = BigInt(interval) - (BigInt(Math.floor(Date.now() / 1000)) - BigInt(lastMint));

        return {
          address,
          balance: (Number(balance) / (10 ** Number(dec))).toFixed(2),
          mint,
          timeLeft: timeLeft > 0 ? timeLeft.toString() : "0",
        };
      }
      // Return a default state if no account is connected
      return { address, balance: "0.00", mint: false, timeLeft: "0" };
    } catch (error) {
      console.error(`Error fetching data for token ${address}:`, error);
      return { address, balance: "Error", mint: false, timeLeft: "0" };
    }
  };


  useEffect(() => {
    // Fetches data for all tokens in parallel.
    const updateAllBalances = async () => {
      if (!account) return;

      try {
        // Create an array of promises for all token data fetches
        const promises = tokenNames.map(token => {
          const address = addresses[token.name.toLowerCase()];
          return getBalance(address);
        });

        // Await all promises to resolve
        const results = await Promise.all(promises);

        // Transform the array of results into an object keyed by address
        const dataByAddress = results.reduce((acc, data) => {
          if (data) {
            acc[data.address] = data;
          }
          return acc;
        }, {});

        setTokenData(dataByAddress);
      } catch (error) {
        console.error("Failed to batch load token data:", error);
      }
    };

    updateAllBalances(); // Initial fetch

    const intervalId = setInterval(updateAllBalances, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [account]);


  // Toggles the loading state for a specific button.
  const setButtonLoading = (address, key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [address]: { ...prev[address], [key]: isLoading }
    }));
  };

  // Handles the token minting process for a specific token.
  const onMint = async (tokenAddress) => {
    setButtonLoading(tokenAddress, 'mint', true);
    try {
      const contractInstance = tokenInstance(tokenAddress);
      const tx = await contractInstance.mintToken();
      await tx.wait();
      // Refresh data for the minted token for immediate feedback
      const updatedData = await getBalance(tokenAddress);
      setTokenData(prev => ({ ...prev, [tokenAddress]: updatedData }));
    } catch (err) {
      console.error("Minting failed:", err);
    } finally {
      setButtonLoading(tokenAddress, 'mint', false);
    }
  };

  // Handles adding a token to Metamask.
  const addToMetamask = async (address, imageURL) => {
    setButtonLoading(address, 'add', true);
    try {
      const contractInstance = tokenInstance(address);
      const [dec, symbol] = await Promise.all([
        contractInstance.decimals(),
        contractInstance.symbol()
      ]);

      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: { address, symbol, decimals: Number(dec), image: imageURL },
        },
      });
    } catch (error) {
      console.error("Failed to add token to Metamask:", error);
    } finally {
      setButtonLoading(address, 'add', false);
    }
  };

  const renderRows = () => {
    const { Row, Cell } = Table;

    return tokenNames.map((token, index) => {
      const tokenNameLower = token.name.toLowerCase();
      const tokenAddress = addresses[tokenNameLower];
      const data = tokenData[tokenAddress];
      const isLoading = loadingStates[tokenAddress] || {};

      const imgName = `/logos/${tokenNameLower}.svg`;
      const imgURL = `https://raw.githubusercontent.com/papermoonio/passetHub-mintableERC20/main/mintableERC20-interface/public${imgName}`;
      const expURL = `https://blockscout-passet-hub.parity-testnet.parity.io/token/${tokenAddress}`;

      const balance = data?.balance || "N/A";
      const mintEnabled = data?.mint || false;
      const remainingTime = data?.timeLeft || 0;

      return (
        <Row key={index}>
          <Cell><img src={imgName} style={{ width: 32, height: 32 }} alt={`${token.name} logo`} /></Cell>
          <Cell>{token.name}</Cell>
          <Cell>{token.symbol}</Cell>
          <Cell><a href={expURL} target="_blank" rel="noopener noreferrer">{tokenAddress}</a></Cell>
          <Cell>{balance}</Cell>
          <Cell>
            <Form onSubmit={() => onMint(tokenAddress)}>
              <Button
                type="submit"
                loading={isLoading.mint}
                disabled={isLoading.mint || !mintEnabled}
                color="orange"
                content={mintEnabled ? "Mint" : `${remainingTime}s`}
              />
            </Form>
          </Cell>
          <Cell>
            <Form onSubmit={() => addToMetamask(tokenAddress, imgURL)}>
              <Button
                type="submit"
                loading={isLoading.add}
                disabled={isLoading.add}
                color="orange"
                content="Add"
              />
            </Form>
          </Cell>
        </Row>
      );
    });
  };

  const { Header, Row, HeaderCell, Body } = Table;

  return (
    <div>
      <h3>Token Balance Information</h3>
      <p>
        Information displayed in the following table corresponds to your on-chain balance of each of the following ERC20 tokens on the Polkadot Hub TestNet! <br />
        Users can mint 100 tokens every hour in each ERC20 token contract.
      </p>
      <Container>
        <Table textAlign="center">
          <Header>
            <Row>
              <HeaderCell>Logo</HeaderCell>
              <HeaderCell>Token Name</HeaderCell>
              <HeaderCell>Symbol</HeaderCell>
              <HeaderCell>Address</HeaderCell>
              <HeaderCell>Balance</HeaderCell>
              <HeaderCell>Mint</HeaderCell>
              <HeaderCell>Add to Metamask</HeaderCell>
            </Row>
          </Header>
          <Body>{renderRows()}</Body>
        </Table>
      </Container>
    </div>
  );
};

export default DataFeed;