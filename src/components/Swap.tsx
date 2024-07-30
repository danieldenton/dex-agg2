import React, { useState } from "react";
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

import Alert from "./Alert";
import { RootState } from "../types/state";
import { loadAccount, loadBalances, swap } from "../store/interactions";

export const Swap = () => {
  const [inputToken, setInputToken] = useState("");
  const [outputToken, setOutputToken] = useState("");
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [fee, setFee] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const dispatch = useDispatch();
  const provider = useSelector((state: RootState) => state.provider.connection);
  const account = useSelector((state: RootState) => state.provider.account);
  const tokens = useSelector((state: RootState) => state.tokens.contracts);
  const symbols = useSelector((state: RootState) => state.tokens.symbols);
  const balances = useSelector((state: RootState) => state.tokens.balances);
  const dexAgg = useSelector((state: RootState) => state.dexAgg.contract);
  const isSwapping = useSelector(
    (state: RootState) => state.dexAgg.swapping.isSwapping
  );
  const isSuccess = useSelector(
    (state: RootState) => state.dexAgg.swapping.isSuccess
  );
  const transactionHash = useSelector(
    (state: RootState) => state.dexAgg.swapping.transactionHash
  );

  const handleConnect = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const account = await loadAccount(dispatch);
    await loadBalances(tokens, account, dispatch);
  };

  const handleInputToken = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const target = e.target as HTMLButtonElement;
    setInputToken(target.innerHTML);
  };

  const handleOutputToken = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const target = e.target as HTMLButtonElement;
    setOutputToken(target.innerHTML);
  };

  const handleInput = async (e: React.ChangeEvent<any>) => {
    const inputValue: number = parseInt(e.target.value);
    if (e.target.value === "") {
      setInputAmount(0);
      setOutputAmount(0);
      setFee(0);
      return;
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
        setInputAmount(inputValue);
        const _token1Amount = ethers.utils.parseUnits(e.target.value, "ether");
        const result = await dexAgg.ammSelector(
          tokens[0].address,
          tokens[1].address,
          _token1Amount
        );
        const _token2Amount = Number(
          ethers.utils.formatUnits(result[1].toString(), "ether")
        );
        const unformattedFee = await dexAgg.separateFee(_token1Amount);

        const _fee = Number(
          ethers.utils.formatUnits(unformattedFee[1].toString(), "ether")
        );

        setOutputAmount(_token2Amount);
        setFee(_fee);
      } else {
        setInputAmount(inputValue);
        const _token2Amount = ethers.utils.parseUnits(e.target.value, "ether");
        const result = await dexAgg.ammSelector(
          tokens[1].address,
          tokens[0].address,
          _token2Amount
        );
        const _token1Amount = Number(
          ethers.utils.formatUnits(result[1].toString(), "ether")
        );
        const unformattedFee = await dexAgg.separateFee(_token2Amount);

        const _fee = Number(
          ethers.utils.formatUnits(unformattedFee[1].toString(), "ether")
        );

        setOutputAmount(_token1Amount);
        setFee(_fee);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSwap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowAlert(false);
    if (inputToken === outputToken) {
      window.alert("Invalid token pair");
      return;
    }

    const _inputAmount = ethers.utils.parseUnits(
      inputAmount.toString(),
      "ether"
    );

    try {
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
      setInputAmount(0)
      setOutputAmount(0)
      setFee(0)
      setShowAlert(true);
    } catch (err) {
      console.error(err);
    }
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
                <Dropdown.Item onClick={(e) => handleInputToken(e)}>
                  RUMP
                </Dropdown.Item>
                <Dropdown.Item onClick={(e) => handleInputToken(e)}>
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
                <Dropdown.Item onClick={(e) => handleOutputToken(e)}>
                  RUMP
                </Dropdown.Item>
                <Dropdown.Item onClick={(e) => handleOutputToken(e)}>
                  USD
                </Dropdown.Item>
              </DropdownButton>
            </InputGroup>
          </Row>
          <Row>
            {isSwapping ? (
              <Spinner
                animation="border"
                style={{ display: "block", margin: "0 auto", color: "#CCFF00" }}
              />
            ) : (
              <>
                <Form.Text
                  style={{ marginBottom: "10px" }}
                  className="text-light"
                >
                  .03% Fee: {fee > 0 ? `${fee} ${inputToken}` : "0"}
                </Form.Text>
                {account ? (
                  <Button
                    type="submit"
                    style={{
                      height: "45px",
                      border: "none",
                      backgroundColor: "#7d3cb5",
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
            )}
          </Row>
        </Form>
      </Card>
      {isSwapping ? (
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
      )}
    </div>
  );
};

export default Swap;
