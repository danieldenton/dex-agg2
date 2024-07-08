import React from "react";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";
import { useLocation } from "react-router-dom";

export const Tabs = () => {
  const location = useLocation();

  const links = [
    {
      to: "/",
      text: "Swap",
    },
    {
      to: "/withdraw",
      text: "Withdraw",
    },
  ];

  const linkPills = links.map((link, idx) => {
    return (
      <LinkContainer
        key={idx}
        to={link.to}
        className=
          "text-light" 
        
        style={ location.pathname === link.to ? {backgroundColor: "#7d3cb5"} : {backgroundColor: "rgb(33 37 41)"}}
      >
        <Nav.Link>{link.text}</Nav.Link>
      </LinkContainer>
    );
  });

  return (
    <Nav
      variant="pills"
      defaultActiveKey="/"
      className="justify-content-center my-4"
    >
      {linkPills}
    </Nav>
  );
};

export default Tabs;
