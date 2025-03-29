import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Login from '../features/Auth/pages/Login/Login';

// Páginas de exemplo - implemente conforme suas features reais
import ThesisListPage from '../features/Thesis/pages/ThesisListPage';
import UserProfilePage from '../features/UserProfile/pages/UserProfilePage';
import SignUp from '../features/Auth/pages/Signup/Signup';

function AppRoutes() {
    return (
        <Routes>
            {/* Rotas públicas */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            <Route
                path="/signup"
                element={
                    <PublicRoute>
                        <SignUp />
                    </PublicRoute>
                }
            />

            {/* Rotas privadas */}
            <Route
                path="/thesis"
                element={
                    <PrivateRoute>
                        <ThesisListPage />
                    </PrivateRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <UserProfilePage />
                    </PrivateRoute>
                }
            />

            {/* Redirecionamentos */}
            <Route path="/" element={<Navigate to="/thesis" replace />} />
            <Route path="/login" element={<Navigate to="/login" replace />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Navigate to="/signup" replace />} />
            <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
    );
}

export default AppRoutes;