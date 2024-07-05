import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { HashRouter, Routes, Route } from "react-router-dom";

// Components
import Navigation from "./Navigation";
import Loading from "./Loading";

import { loadProvider, loadNetwork, loadAccount } from "../store/interactions";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const provider = loadProvider(dispatch);

    const chainId = await loadNetwork(provider, dispatch);

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async () => {
      await loadAccount(dispatch);
    });

    // await loadTokens(provider, chainId, dispatch);
    // await loadAMM(provider, chainId, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <Container>
      <Navigation />

      <h1 className="my-4 text-center">Dex Aggregator</h1>

      {/* {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className="text-center">
            <strong>Your ETH Balance:</strong> {balance} ETH
          </p>
          <p className="text-center">Edit App.js to add your code here.</p>
        </>
      )} */}
    </Container>
  );
}

export default App;
