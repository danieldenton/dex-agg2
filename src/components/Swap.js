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

import { swap, loadBalances } from "../store/interactions";

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

  return (
    <div>
      <Card
        style={{
          maxWidth: "550px",
          borderRadius: "5%",
          border: "solid 4px purple",
        }}
        className="mx-auto  bg-dark"
      >
        {account ? (
          <Form
            // onSubmit={handleSwap}
            style={{ maxWidth: "450px", margin: "50px auto" }}
          >
            <Row className="my-3">
              <div className="d-flex justify-content-between">
                <Form.Label className="text-light">
                  <strong>Input:</strong>
                </Form.Label>
                <Form.Text className="text-light">
                  Balance:{" "}
                  {/* {inputToken === symbols[0]
                        ? balances[0]
                        : inputToken === symbols[1]
                        ? balances[1]
                        : 0} */}
                </Form.Text>
              </div>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0.0"
                  min="0.0"
                  step="any"
                  //   onChange={(e) => handleInput(e)}
                  //   disabled={!inputToken}
                  className="bg-light border-light"
                />
                <DropdownButton
                  variant="outline-light text-light bg-dark"
                  //   title={inputToken ? inputToken : "Select Token"}
                >
                  <Dropdown.Item
                  // onClick={(e) => setInputToken(e.target.innerHTML)}
                  >
                    RUMP
                  </Dropdown.Item>
                  <Dropdown.Item
                  // onClick={(e) => setInputToken(e.target.innerHTML)}
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
                  {/* {outputToken === symbols[0]
                        ? balances[0]
                        : outputToken === symbols[1]
                        ? balances[1]
                        : 0} */}
                </Form.Text>
              </div>
              <InputGroup>
                <Form.Control
                  type="number"
                  placeholder="0.0"
                  //   value={outputAmount === 0 ? "" : outputAmount}
                  disabled
                  className="bg-light border-light"
                />
                <DropdownButton
                  variant="outline-light text-light bg-dark"
                  //   title={outputToken ? outputToken : "Select Token"}
                >
                  <Dropdown.Item
                    // onClick={(e) => setOutputToken(e.target.innerHTML)}
                  >
                    RUMP
                  </Dropdown.Item>
                  <Dropdown.Item
                    // onClick={(e) => setOutputToken(e.target.innerHTML)}
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
                <Button
                  type="submit"
                  className="text-light"
                  style={{ backgroundColor: "purple", border: 'none'}}
                >
                  Swap
                </Button>
                <Form.Text style={{ marginTop: '10px'}} className="text-light">Exchange Rate: </Form.Text>
                <Form.Text style={{ marginTop: '10px'}} className="text-light">.03% Fee: </Form.Text>
                {/* <Form.Text className="text-light">Exchange Rate: {price}</Form.Text>
                      <Form.Text className="text-light">.03% Fee: {fee}</Form.Text> */}
              </>
              {/* )} */}
            </Row>
          </Form>
        ) : (
          <p
            className="d-flex justify-content-center align-items-center"
            style={{ height: "300px" }}
          >
            Please connect wallet
          </p>
        )}
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
