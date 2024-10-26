import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import PatientProfile from "./components/PatientProfile";
import DoctorProfile from "./components/DoctorProfile";
import Doctor from "./components/Doctor"; // Main Doctor component
import Patient from "./components/Patient"; // Main Patient component
import Admin from "./components/Admin";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import styles

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/doctor"
            element={<PrivateRoute role="doctor" Component={Doctor} />}
          />
          <Route
            path="/patient"
            element={<PrivateRoute role="patient" Component={Patient} />}
          />
          <Route
            path="/admin"
            element={<PrivateRoute role="admin" Component={Admin} />}
          />
          <Route
            path="/patient-profile"
            element={<PrivateRoute role="patient" Component={PatientProfile} />}
          />
          <Route
            path="/doctor-profile"
            element={<PrivateRoute role="doctor" Component={DoctorProfile} />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        
        <ToastContainer position="top-right" autoClose={3000} /> {/* Move ToastContainer here */}
      </AuthProvider>
    </Router>
  );
};

// Private Route Component
const PrivateRoute = ({ role, Component }) => {
  const { userRole } = useAuth();
  return userRole === role ? <Component /> : <Navigate to="/login" />;
};

export default App;