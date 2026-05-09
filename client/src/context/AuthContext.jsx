/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerUser } from "../models/authModel";
import { getCurrentUser } from "../models/userModel";
import { getErrorMessage } from "../lib/errorMessage";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
             setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error("Auth verification failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      const { token, ...userData } = response.data;
      
      setToken(token);
      setUser(userData);
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: getErrorMessage(error, "Login failed")
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await registerUser(username, email, password);
      const { token, ...userData } = response.data;
      
      setToken(token);
      setUser(userData);
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
       console.error("Register error:", error);
      return { 
        success: false, 
        message: getErrorMessage(error, "Registration failed")
      };
    }
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Failed to refresh user", err);
      }
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
