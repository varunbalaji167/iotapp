// // src/App.jsx
// import React from "react";
// import {
//   BrowserRouter as Router,
//   Route,
//   Routes,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import Login from "./components/Login";
// import Register from "./components/Register";
// import PatientProfile from "./components/PatientProfile"; // Import the PatientProfile component
// import DoctorProfile from "./components/DoctorProfile"; // Import the DoctorProfile component

// const App = () => {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/doctor" element={<PrivateRoute role="doctor" />} />
//           <Route path="/patient" element={<PrivateRoute role="patient" />} />
//           <Route path="/admin" element={<PrivateRoute role="admin" />} />
//           <Route path="/patient-profile" element={<PrivateRouteProfile role="patient" />} />
//           <Route path="/doctor-profile" element={<PrivateRouteProfile role="doctor" />} />
//           <Route path="/" element={<Navigate to="/login" />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// };

// // PrivateRoute Component
// const PrivateRoute = ({ role }) => {
//   const { userRole } = useAuth();

//   const Component = React.useMemo(() => {
//     switch (role) {
//       case "doctor":
//         return React.lazy(() => import("./components/Doctor"));
//       case "patient":
//         return React.lazy(() => import("./components/Patient"));
//       case "admin":
//         return React.lazy(() => import("./components/Admin"));
//       default:
//         return null;
//     }
//   }, [role]);

//   return userRole === role ? (
//     <React.Suspense fallback={<div>Loading...</div>}>
//       <Component />
//     </React.Suspense>
//   ) : (
//     <Navigate to="/login" />
//   );
// };

// // PrivateRouteProfile Component
// const PrivateRouteProfile = ({ role }) => {
//   const { userRole } = useAuth();

//   const ProfileComponent = React.useMemo(() => {
//     switch (role) {
//       case "doctor":
//         return DoctorProfile;
//       case "patient":
//         return PatientProfile;
//       default:
//         return null;
//     }
//   }, [role]);

//   return userRole === role ? (
//     <React.Suspense fallback={<div>Loading...</div>}>
//       <ProfileComponent />
//     </React.Suspense>
//   ) : (
//     <Navigate to="/login" />
//   );
// };

// export default App;

//App.jsx
import React from "react";
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

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor" element={<PrivateRoute role="doctor" />} />
          <Route path="/patient" element={<PrivateRoute role="patient" />} />
          <Route path="/admin" element={<PrivateRoute role="admin" />} />
          <Route path="/patient-profile" element={<PrivateRouteProfile role="patient" />} />
          <Route path="/doctor-profile" element={<PrivateRouteProfile role="doctor" />} />
          <Route path="/patients" element={<PatientList />} /> {/* New route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

const PrivateRoute = ({ role }) => {
  const { userRole } = useAuth();

  const Component = React.useMemo(() => {
    switch (role) {
      case "doctor":
        return React.lazy(() => import("./components/Doctor"));
      case "patient":
        return React.lazy(() => import("./components/Patient"));
      case "admin":
        return React.lazy(() => import("./components/Admin"));
      default:
        return null;
    }
  }, [role]);

  return userRole === role ? (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component />
    </React.Suspense>
  ) : (
    <Navigate to="/login" />
  );
};

const PrivateRouteProfile = ({ role }) => {
  const { userRole } = useAuth();

  const ProfileComponent = React.useMemo(() => {
    switch (role) {
      case "doctor":
        return DoctorProfile;
      case "patient":
        return PatientProfile;
      default:
        return null;
    }
  }, [role]);

  return userRole === role ? (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ProfileComponent />
    </React.Suspense>
  ) : (
    <Navigate to="/login" />
  );
};

const PatientList = () => {
  const [patients, setPatients] = React.useState([]);
  
  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axiosInstance.get("/users/patients/");
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients", error);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div>
      <h2>Patient List</h2>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id}>
            {patient.name} ({patient.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;