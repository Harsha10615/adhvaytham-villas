import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state from localStorage
    const userToken = localStorage.getItem('userToken');
    const adminToken = localStorage.getItem('adminToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    if (adminToken && userInfo?.role === 'admin') {
      setAdmin(userInfo);
    }
    
    if (userToken && userInfo?.role === 'user') {
      setUser(userInfo);
    }
    
    setLoading(false);
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
    navigate('/home');
  };

  const loginAdmin = (adminData, token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('userInfo', JSON.stringify(adminData));
    setAdmin(adminData);
    navigate('/admin/dashboard');
  };

  const logout = () => {
    const wasAdmin = !!admin;
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    setAdmin(null);
    
    if (wasAdmin) {
      navigate('/admin/login');
    } else {
      navigate('/');
    }
  };

  const value = {
    user,
    admin,
    loading,
    loginUser,
    loginAdmin,
    logout,
    isAuthenticated: !!user || !!admin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
