import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useDispatch } from "react-redux";
import "../App.css";

import Navigation from "./Navigation";
import Swap from "./Swap";

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadDexAgg,
} from "../store/interactions";

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

    await loadTokens(provider, chainId, dispatch);
    await loadDexAgg(provider, chainId, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <Container className="bg-dark" style={{ height: "100%" }}>
      <Navigation />
      <hr />
      <Swap />
    </Container>
  );
}

export default App;
