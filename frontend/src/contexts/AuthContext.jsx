// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && user.role ? user.role : null;
  });

  const [userProfilePic, setUserProfilePic] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && user.profile_picture ? user.profile_picture : null;
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
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
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
