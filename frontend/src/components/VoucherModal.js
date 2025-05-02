import React, { useState } from 'react';
import '../styles/VoucherModal.css'; 

const vouchersData = [
  { id: 1, title: 'Gas Voucher', pointsRequired: 1000, code: 'GAS-100' },
  { id: 2, title: 'Electricity Voucher', pointsRequired: 10000, code: 'ELEC-250' },
  { id: 3, title: 'Water Bill Voucher', pointsRequired: 15000, code: 'WATER-200' },
];

const VoucherModal = ({ userPoints, onClose }) => {
  const [revealedVouchers, setRevealedVouchers] = useState({});

  const handleCopy = (voucher) => {
    navigator.clipboard.writeText(voucher.code);
    setRevealedVouchers((prev) => ({
      ...prev,
      [voucher.id]: true,
    }));
  };

  return (
    <div className="voucher-modal-overlay">
      <div className="voucher-modal">
        <h2 className="voucher-title">Redeem Your Vouchers</h2>
        <div className="voucher-cards">
          {vouchersData.map((voucher) => {
            const isAvailable = userPoints >= voucher.pointsRequired;
            const isRevealed = revealedVouchers[voucher.id];

            return (
              <div
                key={voucher.id}
                className={`voucher-card ${isAvailable ? 'available' : 'unavailable'}`}
              >
                <h3>{voucher.title}</h3>
                <p>Points Required: {voucher.pointsRequired}</p>
                {isAvailable ? (
                  <>
                    {isRevealed ? (
                      <p className="voucher-code">{voucher.code}</p>
                    ) : (
                      <button
                        className="copy-button"
                        onClick={() => handleCopy(voucher)}
                      >
                        Copy Voucher
                      </button>
                    )}
                  </>
                ) : (
                  <p className="not-enough-points">Not enough points</p>
                )}
              </div>
            );
          })}
        </div>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default VoucherModal;
