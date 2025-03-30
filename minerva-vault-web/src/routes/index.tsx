import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Login from "../features/Auth/pages/Login/Login";
import HomePage from "../features/Home/pages/HomePage";

import ThesisListPage from "../features/Thesis/pages/ThesisListPage";
import UserProfilePage from "../features/UserProfile/pages/UserProfilePage";
import SignUp from "../features/Auth/pages/Signup/Signup";
import UserThesisListPage from "../features/Thesis/pages/UserThesisListPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            <Route
                path="/cadastro"
                element={
                    <PublicRoute>
                        <SignUp />
                    </PublicRoute>
                }
            />

            <Route path="/monografias" element={<ThesisListPage />} />

            <Route
                path="/perfil"
                element={
                    <PrivateRoute>
                        <UserProfilePage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/minhas-monografias"
                element={
                    <PrivateRoute>
                        <UserThesisListPage />
                    </PrivateRoute>
                }
            />

            <Route path="/login" element={<Navigate to="/login" replace />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Navigate to="/cadastro" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
