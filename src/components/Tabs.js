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
      to: "/charts",
      text: "Charts",
    },
  ];

  const linkPills = links.map((link, idx) => {
    return (
      <LinkContainer
        key={idx}
        to={link.to}
        className={location.pathname === link.to ? "text-light" : "text-light"}
        style={{
          backgroundColor:
            location.pathname === link.to ? "#7D3CB5" : "transparent",
         
        }}
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
