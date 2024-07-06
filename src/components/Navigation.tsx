import React from "react";
import { useSelector } from "react-redux";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Blockies from "react-blockies";

import { RootState, Config } from "../types/state";
import configData from "../config.json";

const Navigation = () => {
  const chainId = useSelector((state: RootState) => state.provider.chainId);
  const account = useSelector((state: RootState) => state.provider.account);
  const config = configData as Config

  const handleNetwork = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (window.ethereum) {
      try {
        console.log(e.target.value, chainId);
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: e.target.value }],
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      console.error("MetaMask is not installed");
    }
  };

  return (
    <Navbar className="my-3 bg-dark" expand="lg" style={{ minHeight: "80px" }}>
      <Navbar.Brand className="fw-bold" style={{ color: "#CCFF00" }}>
        Dex Aggregator
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="nav" />
      <Navbar.Collapse id="nav" className="justify-content-end">
        <div className="d-flex justify-content-end mt-3 bg-dark border-light">
          {account ? (
            <Navbar.Text
              style={{ marginRight: "20px" }}
              className="d-flex align-items-center text-light"
            >
              {account.slice(0, 5) + "..." + account.slice(38, 42)}
              <Blockies
                seed={account}
                size={10}
                scale={3}
                color="#7D3CB5"
                bgColor="rgb(13 110 253)"
                spotColor="white"
                className="identicon mx-2"
              />
            </Navbar.Text>
          ) : (
            <></>
          )}
          <Form.Select
            className="bg-light border-light text-dark"
            aria-label="Network Selector"
            value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
            onChange={handleNetwork}
            style={{ maxWidth: "200px", marginRight: "20px" }}
          >
            <option value="0" disabled>
              Select Network
            </option>
            <option value="0x7A69">Localhost</option>
            <option value="0xaa36a7">Sepolia</option>
          </Form.Select>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
