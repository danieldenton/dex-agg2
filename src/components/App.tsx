import React from "react";
import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import "../App.css";

import Navigation from "./Navigation";
import Tabs from "./Tabs";
import Swap from "./Swap";
import Withdraw from "./Withdraw";

import { RootState } from "../types/state";
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadDexAgg,
} from "../store/interactions";

function App() {
  const account = useSelector((state: RootState) => state.provider.account);
  const oa ="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
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
  });

  return (
    <Container className="bg-dark" style={{ height: "100%" }}>
      <HashRouter>
        <Navigation />
        <hr className={account === oa ? "" : "hr"}/>
        {account === oa ?
        <Tabs /> : null}
        <Routes>
          <Route path="/" element={<Swap />} />
          <Route path="/withdraw" element={<Withdraw />} />
        </Routes>
      </HashRouter>
    </Container>
  );
}

export default App;
