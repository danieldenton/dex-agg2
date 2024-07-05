import { useSelector, useDispatch } from "react-redux";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Blockies from "react-blockies";

import { loadAccount } from "../store/interactions";
import config from "../config.json";

const Navigation = () => {
  const chainId = useSelector((state) => state.provider.chainId);
  const account = useSelector((state) => state.provider.account);
  // const tokens = useSelector((state) => state.tokens.contracts);
  // const amm = useSelector((state) => state.amm.contract);
  const dispatch = useDispatch();

  const handleNetwork = async (e) => {
    console.log(e.target.value, chainId);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }],
    });
  };

  return (
    <Navbar className="my-3 bg-dark" expand="lg">
      {/* <img
          alt="logo"
          src={logo}
          width="50"
          height="50"
          style={{ borderRadius: '100%'}}
          className="d-inline-block align-top mx-3"
        /> */}
      <Navbar.Brand className="text-light fw-bold" href="#">
        Dex Aggregator
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="nav" />
      <Navbar.Collapse id="nav" className="justify-content-end">
        <div className="d-flex justify-content-end mt-3 bg-dark border-light">
          {account ? (
            <Navbar.Text style={{ marginRight: '20px'}} className="d-flex align-items-center text-light">
              {account.slice(0, 5) + "..." + account.slice(38, 42)}
              <Blockies
                seed={account}
                size={10}
                scale={3}
                color="purple"
                bgColor="blue"
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
