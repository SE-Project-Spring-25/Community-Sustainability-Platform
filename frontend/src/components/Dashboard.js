import React from "react";
import Leaderboard from "./Leaderboard";
import StatsSection from "./StatsSection";
import ContentSection from "./ContentSection";
import "../styles/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container" data-testid="content-section">
      <div className="content-container">
        <ContentSection />
      </div>


      <div className="stats-section" data-testid="stats-section">
        <StatsSection />
      </div>

      <div className="leaderboard-section" data-testid="leaderboard-section">
        <Leaderboard />
      </div>
    </div>
  );
};

export default Dashboard;
