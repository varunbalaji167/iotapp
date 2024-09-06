import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { userRole } = useAuth(); // Access user role from context
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (userRole === "patient") {
      navigate("/patient-profile");
    } else if (userRole === "doctor") {
      navigate("/doctor-profile");
    } else {
      // Handle case where userRole is undefined or not recognized
      navigate("/login");
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li><Link to="/doctor" className="text-white">Doctor Page</Link></li>
        <li><Link to="/patient" className="text-white">Patient Page</Link></li>
        <li><Link to="/admin" className="text-white">Admin Page</Link></li>
        <li><button onClick={handleProfileClick} className="text-white">Profile</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;