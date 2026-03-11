/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    // Lắng nghe sự kiện từ axios interceptor để đồng bộ token mới
    useEffect(() => {
        const handleTokenRefreshed = (event) => {
            setToken(event.detail);
        };

        window.addEventListener('auth-token-refreshed', handleTokenRefreshed);
        return () => {
            window.removeEventListener('auth-token-refreshed', handleTokenRefreshed);
        };
    }, []);

    const login = (tokenValue, refreshTokenValue, userData) => {
        localStorage.setItem('token', tokenValue);
        localStorage.setItem('refreshToken', refreshTokenValue);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(tokenValue);
        setRefreshToken(refreshTokenValue);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        window.location.href = '/admin/login'; // Đảm bảo về đúng trang login admin
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
