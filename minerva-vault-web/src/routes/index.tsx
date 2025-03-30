import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Login from '../features/Auth/pages/Login/Login';
import HomePage from '../features/Home/pages/HomePage'; // Importe a nova página

// Páginas de exemplo - implemente conforme suas features reais
import ThesisListPage from '../features/Thesis/pages/ThesisListPage';
import UserProfilePage from '../features/UserProfile/pages/UserProfilePage';
import SignUp from '../features/Auth/pages/Signup/Signup';

function AppRoutes() {
    return (
        <Routes>
            {/* Rota da página inicial */}
            <Route path="/" element={<HomePage />} />

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
                path="/cadastro"
                element={
                    <PublicRoute>
                        <SignUp />
                    </PublicRoute>
                }
            />

            <Route
                path="/monografias"
                element={
                    <ThesisListPage />
                }
            />



            {/* Rotas privadas */}

            <Route
                path="/perfil"
                element={
                    <PrivateRoute>
                        <UserProfilePage />
                    </PrivateRoute>
                }
            />

            {/* Redirecionamentos */}
            <Route path="/login" element={<Navigate to="/login" replace />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Navigate to="/cadastro" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;