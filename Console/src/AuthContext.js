import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// AuthProvider component to wrap around components that need access to the context
export const AuthProvider = ({ children }) => {
    const [apiKey, setApiKey] = useState(() => {
        // Try to get the API key from localStorage when the component mounts
        return localStorage.getItem('webamon_apikey') || '';
    });

    useEffect(() => {
        // Whenever the API key changes, save it to localStorage
        if (apiKey) {
            localStorage.setItem('webamon_apikey', apiKey);
        } else {
            localStorage.removeItem('webamon_apikey');
        }
    }, [apiKey]);

    return (
        <AuthContext.Provider value={{ apiKey, setApiKey }}>
            {children}
        </AuthContext.Provider>
    );
};
