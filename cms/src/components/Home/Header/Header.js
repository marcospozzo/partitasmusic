import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CONTRIBUTORS, BOOK_PDF } from "../../../utils/constants";

function CenterPanel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeView = pathname.startsWith("/book-pdf") ? BOOK_PDF : CONTRIBUTORS;

  function handleClickContributors() {
    navigate("/");
  }

  function handleClickBookPdf() {
    navigate("/book-pdf");
  }

  return (
    <div className="center-panel">
      <button
        className={activeView === CONTRIBUTORS ? "selected" : "unselected"}
        onClick={handleClickContributors}
      >
        {CONTRIBUTORS}
      </button>
      <button
        className={activeView === BOOK_PDF ? "selected" : "unselected"}
        onClick={handleClickBookPdf}
      >
        {BOOK_PDF}
      </button>
    </div>
  );
}

function RightPanel() {
  const navigate = useNavigate();

  async function handleClick() {
    localStorage.removeItem("jwt");
    navigate("/login");
  }
  return (
    <button onClick={handleClick} className="right-panel unselected">
      Logout
    </button>
  );
}

export default function Header() {
  return (
    <div className="header">
      <Link to="/">
        <img
          className="logo"
          alt="partitas music logo"
          src={`${process.env.PUBLIC_URL}/logo-pm.png`}
        ></img>
      </Link>
      <CenterPanel />
      <RightPanel />
    </div>
  );
}
