import React, { useState } from "react";
import "../styles/UtilitiesModal.css";

const UtilitiesModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    utilityType: "",
    date: "",
    units: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h2>Add Utility Bill</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Utility Type:
            <select name="utilityType" value={formData.utilityType} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Gas">Gas</option>
            </select>
          </label>

          <label>
            Date:
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>

          <label>
            Units Consumed:
            <input type="number" name="units" value={formData.units} onChange={handleChange} required />
          </label>

          <div className="modal-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UtilitiesModal;
