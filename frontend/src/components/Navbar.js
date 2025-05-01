import React, { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { PiUserFill } from "react-icons/pi";
import { GiWallet } from "react-icons/gi";
import "../styles/Navbar.css";

const Navbar = ({ onWalletClick }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2>Community Sustainability</h2>
      </div>

      <div className="nav-right">
        {/* Wallet icon - triggers rewards modal */}
        <span
          className="nav-item-rewards"
          title="Rewards"
          onClick={onWalletClick}
        >
          <GiWallet />
        </span>

        {/* Profile icon */}
        <span
          className="nav-item-profile"
          title="Profile"
          onClick={() => setOpen(!open)}
        >
          <PiUserFill />
        </span>

        {/* Light/Dark toggle */}
        <label className="switch" title="Toggle Theme">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <span className="slider">
            <FaSun className={`icon-sun ${theme === "light" ? "visible" : ""}`} />
            <FaMoon className={`icon-moon ${theme === "dark" ? "visible" : ""}`} />
          </span>
        </label>
      </div>
    </nav>
  );
};

export default Navbar;
