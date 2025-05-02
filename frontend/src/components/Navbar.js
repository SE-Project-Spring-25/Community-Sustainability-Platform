import React, { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import { PiUserFill } from "react-icons/pi";
import { GiWallet } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import API from "../api";
import authService from "../services/authService";
import VoucherModal from "./VoucherModal";
import "../styles/Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [openRewards, setOpenRewards] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const rewardsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // const { data } = await API.get("http://localhost:8000/api/utilities/wallet/");
        const { data } = await API.get("https://community-sustainability-engine.onrender.com/api/utilities/wallet/");
        setBalance(data.points);
      } catch (err) {
        console.error("Failed to load wallet balance:", err);
      }
    };
    fetchBalance();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (rewardsRef.current && !rewardsRef.current.contains(event.target)) {
        setOpenRewards(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();    // should clear tokens in your service
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar" data-theme={theme}>
        <div className="nav-left">
          <h2>Community Sustainability</h2>
        </div>

        <div className="nav-right">
          {/* Rewards dropdown */}
          <div className="nav-item-rewards-wrapper" ref={rewardsRef}>
            <span
              className="nav-item-rewards"
              title="Rewards"
              onClick={() => setOpenRewards(!openRewards)}
            >
              <GiWallet />
            </span>

            {openRewards && (
              <div className="rewards-dropdown">
                <div className="wallet-balance">
                  Balance: {balance} pts
                </div>
                <button
                  className="redeem-button big-button"
                  onClick={() => {
                    setShowVoucherModal(true);
                    setOpenRewards(false);
                  }}
                >
                  Redeem Vouchers
                </button>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="nav-item-profile-wrapper" ref={profileRef}>
            <span
              className="nav-item-profile"
              title="Profile"
              onClick={() => setOpenProfile(!openProfile)}
            >
              <PiUserFill />
            </span>

            {openProfile && (
              <div className="profile-dropdown">
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Light/Dark toggle */}
          <label className="switch" title="Toggle Theme">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
            <span className="slider">
              <FaSun
                className={`icon-sun ${theme === "light" ? "visible" : ""}`}
              />
              <FaMoon
                className={`icon-moon ${theme === "dark" ? "visible" : ""}`}
              />
            </span>
          </label>
        </div>
      </nav>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <VoucherModal
          userPoints={balance}
          onClose={() => setShowVoucherModal(false)}
        />
      )}
    </>
  );
};

export default Navbar;
