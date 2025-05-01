// src/App.js
import React, {useState} from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from "./components/Dashboard";
import RewardsPage from "./components/RewardsPage";
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import authService from './services/authService';
import "./styles/App.css";

function AppContent() {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    const [showRewards, setShowRewards] = useState(false);
    if (showRewards) {
        return <RewardsPage onClose={() => setShowRewards(false)}/>;
    }

    return (
        <>
            {location.pathname === '/dashboard' && isAuthenticated && <Navbar onWalletClick={() => setShowRewards(true)}/>}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
