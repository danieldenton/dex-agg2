import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { HashRouter, Routes, Route } from "react-router-dom";
import "../App.css";

import Navigation from "./Navigation";
import Swap from "./Swap";
import Charts from "./Chart";
import Tabs from "./Tabs";

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
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
    // await loadAMM(provider, chainId, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <Container className="bg-dark" style={{ height: "100%" }}>
      <HashRouter>
        <Navigation />
        <hr />
        <Tabs />
        <Routes>
          <Route exact path="/" element={<Swap />} />
          <Route path="/charts" element={<Charts />} />
        </Routes>
      </HashRouter>
    </Container>
  );
}

export default App;
