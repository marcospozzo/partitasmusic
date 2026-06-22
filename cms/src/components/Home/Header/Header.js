import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { USERS, CONTRIBUTORS } from "../../../utils/constants";

function CenterPanel() {
  const [activeView, setActiveView] = useState(CONTRIBUTORS);
  const navigate = useNavigate();

  function handleClickContributors() {
    setActiveView(CONTRIBUTORS);
    navigate("/");
  }

  function handleClickUsers() {
    setActiveView(USERS);
    navigate("/users");
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
        className={activeView === USERS ? "selected" : "unselected"}
        onClick={handleClickUsers}
      >
        {USERS}
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
