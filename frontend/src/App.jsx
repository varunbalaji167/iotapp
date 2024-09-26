// App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import PatientProfile from "./components/PatientProfile";
import DoctorProfile from "./components/DoctorProfile";
import Doctor from "./components/Doctor"; // Main Doctor component
import Patient from "./components/Patient"; // Main Patient component

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
            path="/patient-profile"
            element={<PrivateRoute role="patient" Component={PatientProfile} />}
          />
          <Route
            path="/doctor-profile"
            element={<PrivateRoute role="doctor" Component={DoctorProfile} />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

// Private Route Component
const PrivateRoute = ({ role, Component }) => {
  const { userRole } = useAuth();

  // If the user is authenticated and has the correct role, render the component
  return userRole === role ? <Component /> : <Navigate to="/login" />;
};

export default App;
