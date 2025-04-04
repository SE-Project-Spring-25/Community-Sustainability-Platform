import React, { useContext, useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from "chart.js";
import "../styles/StatsSection.css";
import { ThemeContext } from "../context/ThemeContext";
import UtilitiesModal from "./UtilitiesModal";

Chart.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const StatsSection = () => {
  const { theme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);

  const pieData = {
    labels: ["Electricity", "Water", "Gas"],
    datasets: [
      {
        data: [45, 30, 25],
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
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Carbon Emissions (kg CO₂)",
        data: [300, 280, 290, 310, 330, 350, 340, 360, 370, 380, 400, 420],
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.3,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {},
    },
    scales: {
      x: {},
      y: {},
    },
  };

  return (
    <div className="stats-container" data-theme={theme}>
      {/* Header with Plus button */}
      <div className="utilities-header">
        <h3>Add Utilities</h3>
        <button className="plus-button" onClick={() => setOpen(true)}>+</button>
      </div>

      <br/>

      <h2 className="stats-title">Last Month's Resource Consumption</h2>
      <div className="chart-wrapper">
        <Doughnut data={pieData} options={pieOptions} />
      </div>

<br/>
<br/>

      <h2 className="stats-title">Monthly Carbon Emissions Trend</h2>
      <div className="chart-wrapper">
        <Line data={lineData} options={lineOptions} />
      </div>

      {open && <UtilitiesModal open={open} onClose={() => setOpen(false)} />}
    </div>
  );
};

export default StatsSection;
