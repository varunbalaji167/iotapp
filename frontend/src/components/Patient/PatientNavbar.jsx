import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const PatientNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Get current location

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-lg font-bold">Portable Health Kiosk</div>
        <div className="hidden md:flex space-x-8">
          <Link
            to="/patient"
            className={`py-2 transition duration-200 ${
              isActive("/patient") ? "underline" : "hover:text-gray-300"
            }`}
          >
            Home
          </Link>
          <Link
            to="/patient-profile"
            className={`py-2 transition duration-200 ${
              isActive("/patient-profile") ? "underline" : "hover:text-gray-300"
            }`}
          >
            Profile
          </Link>
          <Link
            to="/patienthistory"
            className={`py-2 transition duration-200 ${
              isActive("/patienthistory") ? "underline" : "hover:text-gray-300"
            }`}
          >
            History
          </Link>
          <Link
            to="/"
            className="bg-red-500 px-5 py-2 rounded-md hover:bg-red-400 transition duration-200"
          >
            Logout
          </Link>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            {/* Mobile menu button */}
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          {isOpen && (
            <div className="absolute top-16 right-4 bg-gray-700 rounded-md shadow-lg z-10 transition-all duration-300 ease-in-out">
              <Link
                to="/patient"
                className={`block px-6 py-3 transition duration-200 ${
                  isActive("/patient") ? "underline" : "hover:bg-gray-600"
                }`}
              >
                Home
              </Link>
              <Link
                to="/patient-profile"
                className={`block px-6 py-3 transition duration-200 ${
                  isActive("/patient-profile") ? "underline" : "hover:bg-gray-600"
                }`}
              >
                Profile
              </Link>
              <Link
                to="/patienthistory"
                className={`block px-6 py-3 transition duration-200 ${
                  isActive("/patienthistory") ? "underline" : "hover:bg-gray-600"
                }`}
              >
                History
              </Link>
              <Link
                to="/"
                className="block px-6 py-3 bg-red-500 rounded-b-md hover:bg-red-400 transition duration-200"
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PatientNavbar;