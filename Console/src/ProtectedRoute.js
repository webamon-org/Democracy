import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element }) => {
    const { apiKey } = useAuth();

    return apiKey ? element : <Navigate to="/login" />;
};


export default ProtectedRoute;
