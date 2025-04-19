import React, {useContext, useEffect, useState} from "react";
import {Doughnut, Line} from "react-chartjs-2";
import {ArcElement, CategoryScale, Chart, Legend, LinearScale, LineElement, PointElement, Tooltip} from "chart.js";
import "../styles/StatsSection.css";
import {ThemeContext} from "../context/ThemeContext";
import UtilitiesModal from "./UtilitiesModal";
import API from "../api";

Chart.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const StatsSection = () => {
    const {theme} = useContext(ThemeContext);
    const [open, setOpen] = useState(false);
    // State for chart data
    const [pieData, setPieData] = useState({
        labels: [],
        datasets: [],
    });
    const [lineData, setLineData] = useState({
        labels: [],
        datasets: [],
    });

    // Function to fetch stats from your backend
    const fetchStats = async () => {
        try {
            // Expecting backend to return an object like:
            // {
            //   "resourceConsumption": {
            //     "Household Energy": 120,
            //     "Food Consumption": 80,
            //     "Transportation Emission": 100
            //   },
            //   "monthlyEmissions": [300, 280, 290, 310, 330, 350, 340, 360, 370, 380, 400, 420],
            //   "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            // }
            const response = await API.get("http://localhost:8000/api/utilities/stats/");
            const stats = response.data;

            // Set up pie chart data
            setPieData({
                labels: Object.keys(stats.resourceConsumption),
                datasets: [
                    {
                        data: Object.values(stats.resourceConsumption),
                        backgroundColor: [
                            "rgba(54, 162, 235, 0.8)",
                            "rgba(75, 192, 192, 0.8)",
                            "rgba(255, 159, 64, 0.8)",
                        ],
                        borderColor: [
                            "rgba(54, 162, 235, 1)",
                            "rgba(75, 192, 192, 1)",
                            "rgba(255, 159, 64, 1)",
                        ],
                        borderWidth: 2,
                        hoverOffset: 8,
                    },
                ],
            });

            // Set up line chart data
            setLineData({
                labels: stats.labels,
                datasets: [
                    {
                        label: "Carbon Emissions (kg CO₂)",
                        data: stats.monthlyEmissions,
                        fill: false,
                        borderColor: "rgba(255, 99, 132, 1)",
                        tension: 0.3,
                        pointBackgroundColor: "rgba(255, 99, 132, 1)",
                        pointBorderColor: "#fff",
                        pointHoverBackgroundColor: "#fff",
                        pointHoverBorderColor: "rgba(255, 99, 132, 1)",
                    },
                ],
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Refresh stats on mount and each time modal closes (assuming data may have updated)
    useEffect(() => {
        fetchStats();
    }, [open]); // When open changes (e.g. modal closed), refresh stats

    return (
        <div className="stats-container" data-theme={theme}>
            {/* Header with Plus button */}
            <div className="utilities-header">
                <h3>Add Utilities</h3>
                <button className="plus-button" onClick={() => setOpen(true)}>
                    +
                </button>
            </div>

            <br/>

            <h2 className="stats-title">Last Month's Resource Consumption</h2>
            <div className="chart-wrapper">
                <Doughnut
                    data={pieData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {legend: {position: "bottom"}},
                    }}
                />
            </div>

            <br/>
            <br/>

            <h2 className="stats-title">Monthly Carbon Emissions Trend</h2>
            <div className="chart-wrapper">
                <Line
                    data={lineData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {legend: {}},
                        scales: {x: {}, y: {}},
                    }}
                />
            </div>

            {open && <UtilitiesModal open={open} onClose={() => setOpen(false)}/>}
        </div>
    );
};

export default StatsSection;
