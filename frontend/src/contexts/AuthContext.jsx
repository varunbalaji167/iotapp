// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role) {
      setUserRole(user.role);
    }
  }, []);

  const login = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUserRole(user.role);
    // Redirect based on role
    switch (user.role) {
      case "doctor":
        navigate("/doctor");
        break;
      case "patient":
        navigate("/patient");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/login");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUserRole(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

