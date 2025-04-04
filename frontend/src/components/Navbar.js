import React, { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { PiUserFill } from "react-icons/pi";
import { GiWallet } from "react-icons/gi";
import "../styles/Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2>Community Sustainability</h2>
      </div>
      <div className="nav-right">
        <span className="nav-item-rewards"><GiWallet /></span>
        <span className="nav-item-profile"><PiUserFill /></span>

        {/* Modern Toggle Switch */}
        <label className="switch">
          <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
          <span className="slider">
            <FaSun className={`icon-sun ${theme === "light" ? "visible" : ""}`} />
            <FaMoon className={`icon-moon ${theme === "dark" ? "visible" : ""}`} />
          </span>
        </label>

        <div className="profile" data-testid="profile-icon" onClick={() => setOpen(!open)}></div>
      </div>
    </nav>
  );
};

export default Navbar;
