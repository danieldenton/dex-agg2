import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ethers } from "ethers";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";

import { loadAccount, loadBalances, swap } from "../store/interactions";

export const Swap = () => {
  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [fee, setFee] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  const dispatch = useDispatch();

  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const tokens = useSelector((state) => state.tokens.contracts);
  const symbols = useSelector((state) => state.tokens.symbols);
  const balances = useSelector((state) => state.tokens.balances);
  const dexAgg = useSelector((state) => state.dexAgg.contract);

  const handleConnect = async () => {
    const account = await loadAccount(dispatch);
    await loadBalances(tokens, account, dispatch);
  };

  const handleInput = async (e) => {
    if (e.target.value === "") {
      setInputAmount(0);
      setOutputAmount(0)
      setFee(0);
      return
    }
    if (!inputToken || !outputToken) {
      window.alert("Please select a token");
      return;
    }

    if (inputToken === outputToken) {
      window.alert("Invalid token pair");
      return;
    }
    try {
      if (inputToken === "RUMP") {
        setInputAmount(e.target.value);
        const _token1Amount = ethers.utils.parseUnits(e.target.value, "ether");
        const result = await dexAgg.ammSelector(
          tokens[0].address,
          tokens[1].address,
          _token1Amount
        );
        const _token2Amount = ethers.utils.formatUnits(
          result[1].toString(),
          "ether"
        );
        const unformattedFee = await dexAgg.separateFee(_token1Amount);

        const _fee = ethers.utils.formatUnits(
          unformattedFee[1].toString(),
          "ether"
        );

        setOutputAmount(_token2Amount);
        setFee(_fee);
      } else {
        setInputAmount(e.target.value);
        const _token2Amount = ethers.utils.parseUnits(e.target.value, "ether");
        const result = await dexAgg.ammSelector(
          tokens[1].address,
          tokens[0].address,
          _token2Amount
        );
        const _token1Amount = ethers.utils.formatUnits(
          result[1].toString(),
          "ether"
        );
        const unformattedFee = await dexAgg.separateFee(_token2Amount);

        const _fee = ethers.utils.formatUnits(
          unformattedFee[1].toString(),
          "ether"
        );

        setOutputAmount(_token1Amount);
        setFee(_fee);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSwap = async (e) => {
    e.preventDefault();
    setShowAlert(false);
    if (inputToken === outputToken) {
      window.alert("Invalid token pair");
      return;
    }

    const _inputAmount = ethers.utils.parseUnits(inputAmount, "ether");

    if (inputToken === "RUMP") {
      await swap(
        provider,
        dexAgg,
        tokens[0],
        tokens[1],
        _inputAmount,
        dispatch
      );
    } else {
      await swap(
        provider,
        dexAgg,
        tokens[1],
        tokens[0],
        _inputAmount,
        dispatch
      );
    }

    await loadBalances(tokens, account, dispatch);
    setShowAlert(true);
  };

  return (
    <div>
      <Card
        style={{
          maxWidth: "550px",
          borderRadius: "5%",
          border: "solid 4px #7D3CB5",
        }}
        className="mx-auto  bg-dark"
      >
        <Form
          onSubmit={account ? handleSwap : handleConnect}
          style={{ maxWidth: "450px", margin: "50px auto" }}
        >
          <Row className="my-3">
            <div className="d-flex justify-content-between">
              <Form.Label className="text-light">
                <strong>Input:</strong>
              </Form.Label>
              <Form.Text className="text-light">
                Balance:{" "}
                {inputToken === symbols[0]
                  ? balances[0]
                  : inputToken === symbols[1]
                  ? balances[1]
                  : 0}
              </Form.Text>
            </div>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="0.0"
                min="0.0"
                step="any"
                onChange={(e) => handleInput(e)}
                disabled={!inputToken}
                className="bg-light border-light"
              />
              <DropdownButton
                variant="outline-light text-light bg-dark"
                title={inputToken ? inputToken : "Select Token"}
              >
                <Dropdown.Item
                  onClick={(e) => setInputToken(e.target.innerHTML)}
                >
                  RUMP
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={(e) => setInputToken(e.target.innerHTML)}
                >
                  USD
                </Dropdown.Item>
              </DropdownButton>
            </InputGroup>
          </Row>
          <Row className="my-4">
            <div className="d-flex justify-content-between">
              <Form.Label className="text-light">
                <strong>Output:</strong>
              </Form.Label>
              <Form.Text className="text-light">
                Balance:{" "}
                {outputToken === symbols[0]
                  ? balances[0]
                  : outputToken === symbols[1]
                  ? balances[1]
                  : 0}
              </Form.Text>
            </div>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="0.0"
                value={outputAmount === 0 ? "" : outputAmount}
                disabled
                className="bg-light border-light"
              />
              <DropdownButton
                variant="outline-light text-light bg-dark"
                title={outputToken ? outputToken : "Select Token"}
              >
                <Dropdown.Item
                  onClick={(e) => setOutputToken(e.target.innerHTML)}
                >
                  RUMP
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={(e) => setOutputToken(e.target.innerHTML)}
                >
                  USD
                </Dropdown.Item>
              </DropdownButton>
            </InputGroup>
          </Row>
          <Row>
            {/* {isSwapping ? (
                    <Spinner
                      animation="border"
                      style={{ display: "block", margin: "0 auto", color: "red" }}
                    />
                  ) : ( */}
            <>
              <Form.Text
                style={{ marginBottom: "10px" }}
                className="text-light"
              >
                .03% Fee: {fee > 0 ? fee : "0"}
              </Form.Text>
              {account ? (
                <Button
                  type="submit"
                  className="text-light"
                  style={{
                    height: "45px",
                    backgroundColor: "#7D3CB5",
                    border: "none",
                  }}
                >
                  Swap
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="text-light bg-primary"
                  style={{
                    height: "45px",
                    border: "none",
                  }}
                >
                  Connect Wallet
                </Button>
              )}
            </>
          </Row>
        </Form>
      </Card>
      {/* {isSwapping ? (
            <Alert
              message={"Swap Pending..."}
              transactionHash={null}
              variant={"info"}
              setShowAlert={setShowAlert}
            />
          ) : isSuccess && showAlert ? (
            <Alert
              message={"Swap Successful"}
              transactionHash={transactionHash}
              variant={"success"}
              setShowAlert={setShowAlert}
            />
          ) : !isSuccess && showAlert ? (
            <Alert
              message={"Swap Failed"}
              transactionHash={null}
              variant={"light"}
              setShowAlert={setShowAlert}
            />
          ) : (
            <></>
          )} */}
    </div>
  );
};

export default Swap;
