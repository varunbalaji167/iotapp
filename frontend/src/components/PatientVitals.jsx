import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const PatientVitals = () => {
  const { userRole } = useAuth();
  const [vitals, setVitals] = useState(null);
  const [deviceId, setDeviceId] = useState(""); // For device ID input
  const [deviceRegistered, setDeviceRegistered] = useState(false); // Check if device is registered
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [collectingVitals, setCollectingVitals] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState("");

  // Step 1: Send device_id to the server
  const handleRegisterDevice = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    const headers = {
      Authorization: "Bearer " + token.access,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/device-id/",
        { device_id: deviceId },
        { headers }
      );
      setDeviceRegistered(true);
      setCollectionMessage(`Device ID ${deviceId} registered successfully.`);
    } catch (error) {
      setError(
        `Error registering device: ${
          error.response?.data?.detail || error.message
        }`
      );
      setDeviceRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send "Temperature" message to collect vitals
  const handleCollectVitals = async () => {
    if (!deviceRegistered) {
      setError("Please register your device first.");
      return;
    }

    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    const headers = {
      Authorization: "Bearer " + token.access,
    };

    try {
      setCollectingVitals(true);
      setCollectionMessage("Collecting vitals, please wait...");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/vitals/",
        { message: "Temperature" }, // Sending the "Temperature" message
        { headers }
      );
      setVitals(response.data); // Update the vitals data after collection
      setCollectionMessage("Vitals collected successfully!");
    } catch (error) {
      setError(
        `Error collecting vitals: ${
          error.response?.data?.detail || error.message
        }`
      );
      setCollectionMessage("Failed to collect vitals.");
    } finally {
      setCollectingVitals(false);
    }
  };

  return (
    <div>
      <h1>Patient Vitals</h1>

      {/* Step 1: Device ID Input */}
      {!deviceRegistered && (
        <div>
          <label htmlFor="deviceId">Enter your Device ID:</label>
          <input
            type="text"
            id="deviceId"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="border p-2 mt-2"
          />
          <button
            onClick={handleRegisterDevice}
            disabled={loading || !deviceId}
            className="bg-blue-500 text-white py-2 px-4 mt-4"
          >
            {loading ? "Registering Device..." : "Register Device"}
          </button>
        </div>
      )}

      {/* Step 2: Collect Vitals */}
      {deviceRegistered && (
        <button
          onClick={handleCollectVitals}
          disabled={collectingVitals}
          className="bg-blue-500 text-white py-2 px-4 mt-4"
        >
          {collectingVitals ? "Collecting Vitals..." : "Collect Vitals"}
        </button>
      )}

      {collectionMessage && <p>{collectionMessage}</p>}

      {/* Display vitals if collected */}
      {vitals && (
        <div>
          <p>Temperature: {vitals.temperature} °C</p>
          <p>Heart Rate: {vitals.heart_rate} bpm</p>
          {/* Add other vitals if available */}
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default PatientVitals;


// import React, { useState } from "react";
// import axios from "axios";

// const PatientVitals = () => {
//   const [deviceId, setDeviceId] = useState(""); // Store device ID input
//   const [deviceRegistered, setDeviceRegistered] = useState(false); // Track registration
//   const [vitals, setVitals] = useState(null); // Store vitals data
//   const [loading, setLoading] = useState(false); // For loading state
//   const [error, setError] = useState(""); // Error handling
//   const [collectingVitals, setCollectingVitals] = useState(false); // Track collection state

//   // Handle registering device ID
//   const registerDevice = async () => {
//     const token = JSON.parse(localStorage.getItem("token"));
//     if (!token) {
//       setError("You need to be authenticated.");
//       return;
//     }

//     const headers = {
//       Authorization: "Bearer " + token.access,
//     };

//     try {
//       setLoading(true);
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/users/device-id/",
//         { device_id: deviceId },
//         { headers }
//       );
//       setDeviceRegistered(true);
//       console.log("Device registered successfully:", response.data);
//     } catch (err) {
//       setError("Failed to register device.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle collecting vitals
//   const collectVitals = async () => {
//     if (!deviceRegistered) {
//       setError("You need to register your device first.");
//       return;
//     }

//     const token = JSON.parse(localStorage.getItem("token"));
//     if (!token) {
//       setError("You need to be authenticated.");
//       return;
//     }

//     const headers = {
//       Authorization: "Bearer " + token.access,
//     };

//     try {
//       setCollectingVitals(true);
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/users/vitals/",
//         { message: "Temperature" }, // Sending the message "Temperature"
//         { headers }
//       );
//       setVitals(response.data);
//       console.log("Vitals collected:", response.data);
//     } catch (err) {
//       setError("Failed to collect vitals.");
//       console.error(err);
//     } finally {
//       setCollectingVitals(false);
//     }
//   };

// //   return (
// //     <div className="container">
// //       <h1>Patient Vitals Collection</h1>

// //       {/* Step 1: Register Device */}
// //       {!deviceRegistered && (
// //         <div>
// //           <label htmlFor="device-id">Enter Device ID:</label>
// //           <input
// //             type="text"
// //             id="device-id"
// //             value={deviceId}
// //             onChange={(e) => setDeviceId(e.target.value)}
// //           />
// //           <button
// //             onClick={registerDevice}
// //             disabled={loading || !deviceId}
// //             className="register-btn"
// //           >
// //             {loading ? "Registering..." : "Register Device"}
// //           </button>
// //         </div>
// //       )}

// //       {/* Step 2: Collect Vitals */}
// //       {deviceRegistered && (
// //         <div>
// //           <button
// //             onClick={collectVitals}
// //             disabled={collectingVitals}
// //             className="collect-btn"
// //           >
// //             {collectingVitals ? "Collecting..." : "Collect Vitals"}
// //           </button>
// //         </div>
// //       )}

// //       {/* Display Vitals if collected */}
// //       {vitals && (
// //         <div>
// //           <h2>Vitals Data</h2>
// //           <p>Temperature: {vitals.temperature} °C</p>
// //         </div>
// //       )}

// //       {/* Display error messages */}
// //       {error && <p className="error">{error}</p>}
// //     </div>
// //   );
// // };

// // export default PatientVitals;