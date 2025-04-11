import React, {useState} from "react";
import API from "../api"; // Import the interceptor-configured API instance
import "../styles/UtilitiesModal.css";

const BASE_API_URL = "http://localhost:8000/api/utilities";

const UtilitiesModal = ({open, onClose}) => {
    const [formData, setFormData] = useState({
        utilityType: "", // Options: "Household Energy", "Food Consumption", "Transportation Emission"
        date: "",
        // For Household Energy record:
        units: "",
        // For Food Consumption record:
        servings: "",
        foodType: "",
        // For Transportation Emission record:
        distance: "",
        mode: "",
    });

    if (!open) return null;

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitted Data:", formData);

        let endpoint = "";
        let payload = {};

        if (formData.utilityType === "Household Energy") {
            endpoint = `${BASE_API_URL}/household-energy/`;
            payload = {
                date: formData.date,
                energy_usage: parseFloat(formData.units),
            };
        } else if (formData.utilityType === "Food Consumption") {
            endpoint = `${BASE_API_URL}/food-consumption/`;
            payload = {
                date: formData.date,
                servings: parseInt(formData.servings, 10),
                food_type: formData.foodType,
            };
        } else if (formData.utilityType === "Transportation Emission") {
            endpoint = `${BASE_API_URL}/transportation-emissions/`;
            payload = {
                date: formData.date,
                distance: parseFloat(formData.distance),
                mode: formData.mode,
            };
        } else {
            console.error("No utility type selected.");
            return;
        }

        try {
            // Using our interceptor-enabled API instance
            const response = await API.post(endpoint, payload);
            console.log("API Response:", response.data);
        } catch (error) {
            console.error("Error posting data:", error);
        }

        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2>Add Utility Record</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Utility Type:
                        <select
                            name="utilityType"
                            value={formData.utilityType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select</option>
                            <option value="Household Energy">Household Energy (Electricity)</option>
                            <option value="Food Consumption">Food Consumption</option>
                            <option value="Transportation Emission">Transportation Emission</option>
                        </select>
                    </label>

                    <label>
                        Date:
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    {formData.utilityType === "Household Energy" && (
                        <label>
                            Energy Usage (kWh):
                            <input
                                type="number"
                                name="units"
                                value={formData.units}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    )}

                    {formData.utilityType === "Food Consumption" && (
                        <>
                            <label>
                                Servings:
                                <input
                                    type="number"
                                    name="servings"
                                    value={formData.servings}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Food Type:
                                <select
                                    name="foodType"
                                    value={formData.foodType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="plant">Plant-based</option>
                                    <option value="meat">Meat-based</option>
                                </select>
                            </label>
                        </>
                    )}

                    {formData.utilityType === "Transportation Emission" && (
                        <>
                            <label>
                                Distance (miles):
                                <input
                                    type="number"
                                    name="distance"
                                    value={formData.distance}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label>
                                Mode:
                                <select
                                    name="mode"
                                    value={formData.mode}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="car">Car</option>
                                    <option value="bus">Bus</option>
                                </select>
                            </label>
                        </>
                    )}

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
