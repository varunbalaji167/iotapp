import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import PatientProfile from "./components/Patient/PatientProfile";
import DoctorProfile from "./components/Doctor/DoctorProfile";
import Doctor from "./components/Doctor/Doctor"; // Main Doctor component
import Patient from "./components/Patient/Patient"; // Main Patient component
import Admin from "./components/Admin/Admin";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import styles
import PatientRecords from "./components/Doctor/PatientRecords";
import DoctorVitalsHistory from "./components/Doctor/DoctorVitalsHistory";
import PatientVitalsHistory from  "./components/Patient/PatientVitalsHistory";
import FaceAuth from "./components/Auth/FaceAuth";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/face" element={<FaceAuth />} />
          
          <Route
            path="/admin"
            element={<PrivateRoute role="admin" Component={Admin} />}
          />

          <Route
            path="/doctor"
            element={<PrivateRoute role="doctor" Component={Doctor} />}
          />
          <Route
            path="/doctor-profile"
            element={<PrivateRoute role="doctor" Component={DoctorProfile} />}
          />
          <Route
            path="/records"
            element={<PrivateRoute role="doctor" Component={PatientRecords} />}
          />
          <Route
            path="/doctorhistory"
            element={<PrivateRoute role="doctor" Component={DoctorVitalsHistory} />}
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
            path="/patienthistory"
            element={<PrivateRoute role="patient" Component={PatientVitalsHistory} />}
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