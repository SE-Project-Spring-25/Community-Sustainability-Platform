import React from "react";
import "../styles/Leaderboard.css";

const leaderboardData = {
  top10: [
    { name: "Mike", points: 980 },
    { name: "Emily", points: 920 },
    { name: "James", points: 870 },
    { name: "Olivia", points: 820 },
    { name: "Daniel", points: 780 },
    { name: "Sophia", points: 750 },
    { name: "Benji", points: 720 },
    { name: "Isabella", points: 700 },
    { name: "William", points: 680 },
    { name: "Charles", points: 650 }
  ],
  currentUser: { rank: 18, name: "You", points: 500 }
};

const Leaderboard = () => {
  const { top10, currentUser } = leaderboardData;

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Leaderboards 🏆</h2>
      <div className="leaderboard-list">
        {top10.map((user, index) => (
          <div
            key={index}
            className={`leaderboard-row ${index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : ""}`}
          >
            <span className="rank">{index + 1}</span>
            <span className="name">{user.name}</span>
            <span className="points">{user.points} pts</span>
          </div>
        ))}
        <hr className="leaderboard-separator" />
        <div className="leaderboard-row current-user">
          <span className="rank">{currentUser.rank}</span>
          <span className="name">{currentUser.name}</span>
          <span className="points">{currentUser.points} pts</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
