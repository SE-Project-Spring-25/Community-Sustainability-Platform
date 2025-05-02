import React, {useEffect, useState} from "react";
import API from "../api"; // your axios instance with interceptors
import "../styles/Leaderboard.css";

// const BASE_API_URL = "http://localhost:8000/api/utilities";
const BASE_API_URL = "https://community-sustainability-engine.onrender.com/api/utilities";

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState({
        top10: [],
        currentUser: {rank: null, name: "", points: 0},
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const {data} = await API.get(`${BASE_API_URL}/leaderboard/`);
                setLeaderboardData(data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="leaderboard-container">Loading…</div>;

    const {top10, currentUser} = leaderboardData;

    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">Leaderboards 🏆</h2>
            <div className="leaderboard-list">
                {top10.map((user, idx) => (
                    <div
                        key={idx}
                        className={`leaderboard-row ${
                            idx === 0
                                ? "gold"
                                : idx === 1
                                    ? "silver"
                                    : idx === 2
                                        ? "bronze"
                                        : ""
                        }`}
                    >
                        <span className="rank">{idx + 1}</span>
                        <span className="name">{user.name}</span>
                        <span className="points">{user.points} pts</span>
                    </div>
                ))}

                <hr className="leaderboard-separator"/>

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
