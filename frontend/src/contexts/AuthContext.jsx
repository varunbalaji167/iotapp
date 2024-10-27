// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Helper function to check if a string is valid JSON
const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (isValidJSON(storedUser)) {
      const user = JSON.parse(storedUser);
      return user && user.role ? user.role : null;
    }
    return null;
  });

  const [userProfilePic, setUserProfilePic] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (isValidJSON(storedUser)) {
      const user = JSON.parse(storedUser);
      return user && user.profile_picture ? user.profile_picture : null;
    }
    return null;
  });

  const navigate = useNavigate();

  const login = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUserRole(user.role);
    setUserProfilePic(user.profile_picture); // Store profile picture
    navigate(`/${user.role}`); // Redirect to the role-specific page
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUserRole(null);
    setUserProfilePic(null); // Clear profile picture on logout
    navigate("/login");
  };

  // Effect to handle user state on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (isValidJSON(storedUser)) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role); // Maintain user role on refresh
      setUserProfilePic(user.profile_picture); // Maintain profile picture on refresh
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userRole, userProfilePic, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
