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

const Withdraw = () => {
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  const provider = useSelector((state: RootState) => state.provider.connection);
  const account = useSelector((state: RootState) => state.provider.account);
  const tokens = useSelector((state: RootState) => state.tokens.contracts);
  const symbols = useSelector((state: RootState) => state.tokens.symbols);
  const balances = useSelector((state: RootState) => state.tokens.balances);
  const dexAgg = useSelector((state: RootState) => state.dexAgg.contract);

  const handleToken = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const target = e.target as HTMLButtonElement;
    setToken(target.innerHTML);
  };

  const handleWithdrawal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          onSubmit={handleWithdrawal}
          style={{ maxWidth: "450px", margin: "50px auto" }}
        >
          <Row className="my-4">
            <div className="d-flex justify-content-between">
              <Form.Label className="text-light">
                <strong>Amount to Withdraw:</strong>
              </Form.Label>
            </div>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="0.0"
                value={
                  token
                    ? token === symbols[0]
                      ? balances[0]
                      : balances[1]
                    : ""
                }
                disabled
                className="bg-light border-light"
              />
              <DropdownButton
                variant="outline-light text-light bg-dark"
                title={token ? token : "Select Token"}
              >
                <Dropdown.Item onClick={(e) => handleToken(e)}>
                  RUMP
                </Dropdown.Item>
                <Dropdown.Item onClick={(e) => handleToken(e)}>
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
                  .03% Fee: {fee > 0 ? fee : "0"}
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

export default Withdraw;
