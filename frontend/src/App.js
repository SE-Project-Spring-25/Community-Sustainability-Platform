import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from "./components/Dashboard";

function App() {

    const isAuthenticated = !!localStorage.getItem('accessToken');

    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>

                {/* Protected route */}
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard/> : <Navigate to="/login"/>}
                />

                {/* Redirect any unknown route to login */}
                <Route path="*" element={<Navigate to="/login"/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
