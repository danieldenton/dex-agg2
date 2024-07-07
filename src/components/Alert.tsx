import React from "react";
import { Alert as BootstrapAlert } from "react-bootstrap";

interface Props {
  message: string;
  transactionHash: string | null;
  variant: string;
  setShowAlert: (arg0: boolean) => void;
}

const Alert = ({ message, transactionHash, variant, setShowAlert }: Props) => {
  return (
    <BootstrapAlert
      variant={variant}
      onClose={() => setShowAlert(false)}
      dismissible
      className="alert"
      style={{ maxWidth: '270px', maxHeight: '150px'}}
    >
      <BootstrapAlert.Heading>{message}</BootstrapAlert.Heading>
      <hr />
      {transactionHash && (
        <p>
          {transactionHash.slice(0, 6) + "..." + transactionHash.slice(60, 66)}
        </p>
      )}
    </BootstrapAlert>
  );
};

export default Alert;
