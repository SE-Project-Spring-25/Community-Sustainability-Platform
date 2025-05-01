import React, { useState } from 'react';
import '../styles/RewardsPage.css';

const vouchers = [
  { code: "WATER10", description: "Save 10% on your next water bill!" },
  { code: "SOLAR20", description: "Get 20% off solar installations!" },
  { code: "ELECTRIC5", description: "Flat $5 off your electricity bill!" },
  { code: "GAS15", description: "15% cashback on gas bills!" },
  { code: "RECYCLING25", description: "Earn $25 for recycling participation!" },
];

const RewardsPage = ({ onClose }) => {
  const [revealedCodes, setRevealedCodes] = useState({});

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setRevealedCodes((prev) => ({
      ...prev,
      [index]: true,
    }));
    alert(`Voucher '${code}' copied to clipboard!`);
  };

  const maskCode = (code) => {
    return code.substring(0, Math.floor(code.length / 2)) + "••••";
  };

  const handleOverlayClick = (e) => {
    if (e.target.className.includes('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>✕</button>
        <h2 className="modal-heading">Community Sustainability Rewards</h2>

        <div className="rewards-flex">
          {vouchers.map((voucher, index) => (
            <div
              key={index}
              className="reward-card"
              onClick={() => handleCopy(voucher.code, index)}
            >
              <div className="reward-code">
                {revealedCodes[index] ? voucher.code : maskCode(voucher.code)}
              </div>
              <div className="reward-description">{voucher.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
