// import React, { useState } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import axios from "axios";

// const PatientVitals = () => {
//   const { userRole } = useAuth();
//   const [vitals, setVitals] = useState(null);
//   const [deviceId, setDeviceId] = useState(""); // For device ID input
//   const [deviceRegistered, setDeviceRegistered] = useState(false); // Check if device is registered
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [collectingVitals, setCollectingVitals] = useState(false);
//   const [collectionMessage, setCollectionMessage] = useState("");

//   // Step 1: Send device_id to the server
//   const handleRegisterDevice = async () => {
//     const token = JSON.parse(localStorage.getItem("token"));
//     if (!token) {
//       setError("Authentication token is missing.");
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
//       setCollectionMessage(`Device ID ${deviceId} registered successfully.`);
//     } catch (error) {
//       setError(
//         `Error registering device: ${
//           error.response?.data?.detail || error.message
//         }`
//       );
//       setDeviceRegistered(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Send "Temperature" message to collect vitals
//   const handleCollectVitals = async () => {
//     if (!deviceRegistered) {
//       setError("Please register your device first.");
//       return;
//     }

//     const token = JSON.parse(localStorage.getItem("token"));
//     if (!token) {
//       setError("Authentication token is missing.");
//       return;
//     }

//     const headers = {
//       Authorization: "Bearer " + token.access,
//     };

//     try {
//       setCollectingVitals(true);
//       setCollectionMessage("Collecting vitals, please wait...");
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/users/vitals/",
//         { message: "Temperature" }, // Sending the "Temperature" message
//         { headers }
//       );
//       setVitals(response.data); // Update the vitals data after collection
//       setCollectionMessage("Vitals collected successfully!");
//     } catch (error) {
//       setError(
//         `Error collecting vitals: ${
//           error.response?.data?.detail || error.message
//         }`
//       );
//       setCollectionMessage("Failed to collect vitals.");
//     } finally {
//       setCollectingVitals(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Patient Vitals</h1>

//       {/* Step 1: Device ID Input */}
//       {!deviceRegistered && (
//         <div>
//           <label htmlFor="deviceId">Enter your Device ID:</label>
//           <input
//             type="text"
//             id="deviceId"
//             value={deviceId}
//             onChange={(e) => setDeviceId(e.target.value)}
//             className="border p-2 mt-2"
//           />
//           <button
//             onClick={handleRegisterDevice}
//             disabled={loading || !deviceId}
//             className="bg-blue-500 text-white py-2 px-4 mt-4"
//           >
//             {loading ? "Registering Device..." : "Register Device"}
//           </button>
//         </div>
//       )}

//       {/* Step 2: Collect Vitals */}
//       {deviceRegistered && (
//         <button
//           onClick={handleCollectVitals}
//           disabled={collectingVitals}
//           className="bg-blue-500 text-white py-2 px-4 mt-4"
//         >
//           {collectingVitals ? "Collecting Vitals..." : "Collect Vitals"}
//         </button>
//       )}

//       {collectionMessage && <p>{collectionMessage}</p>}

//       {/* Display vitals if collected */}
//       {vitals && (
//         <div>
//           <p>Temperature: {vitals.temperature} °C</p>
//           <p>Heart Rate: {vitals.heart_rate} bpm</p>
//           {/* Add other vitals if available */}
//         </div>
//       )}

//       {error && <p className="text-red-500">{error}</p>}
//     </div>
//   );
// };

// export default PatientVitals;




import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"; // Adjust this based on your auth context path
import axios from "axios";
import Swal from 'sweetalert2';

const PatientVitals = () => {
  const { userRole } = useAuth();
  const [vitals, setVitals] = useState(null);
  const [deviceId, setDeviceId] = useState(""); // For selected device ID
  const [deviceRegistered, setDeviceRegistered] = useState(false); // Check if device is registered
  const [devices, setDevices] = useState([]); // For the list of devices
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [collectingVitals, setCollectingVitals] = useState(false);
  const [collectionMessage, setCollectionMessage] = useState("");

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token || !token.access) return; // Exit if token is missing

      const headers = {
        Authorization: "Bearer " + token.access,
      };

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/devices/", { headers });
        console.log("Fetched devices:", response.data); // Debug log to see the fetched devices
        setDevices(response.data); // Set the devices fetched from the API
      } catch (error) {
        setError(`Error fetching devices: ${error.response?.data?.detail || error.message}`);
      }
    };

    fetchDevices();
  }, []);

  // Register device function
  const handleRegisterDevice = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) {
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
      Swal.fire({
        icon: 'success',
        title: 'Device Registered',
        text: `Device ID ${deviceId} registered successfully.`,
      });
    } catch (error) {
      setError(`Error registering device: ${error.response?.data?.detail || error.message}`);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.detail || error.message,
      });
      setDeviceRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  // Collect vitals function
  const handleCollectVitals = async () => {
    if (!deviceRegistered) {
      setError("Please register your device first.");
      return;
    }

    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) {
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
      setError(`Error collecting vitals: ${error.response?.data?.detail || error.message}`);
      setCollectionMessage("Failed to collect vitals.");
    } finally {
      setCollectingVitals(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold text-center">Patient Vitals</h1>

      {/* Dropdown for Device ID Selection */}
      {!deviceRegistered && (
        <div className="mt-6">
          <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
            Select your Device ID:
          </label>
          <select
            id="deviceId"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>Select Device ID</option>
            {devices.map((device) => (
              <option key={device.device_id} value={device.device_id}>
                {device.device_id} - {device.device_type} ({device.owner_name})
              </option>
            ))}
          </select>
          <button
            onClick={handleRegisterDevice}
            disabled={loading || !deviceId}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? "Registering Device..." : "Register Device"}
          </button>
        </div>
      )}

      {/* Step 2: Collect Vitals */}
      {deviceRegistered && (
        <div className="mt-6">
          <button
            onClick={handleCollectVitals}
            disabled={collectingVitals}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300"
          >
            {collectingVitals ? "Collecting Vitals..." : "Collect Vitals"}
          </button>
        </div>
      )}

      {collectionMessage && <p className="mt-4 text-green-500">{collectionMessage}</p>}

      {/* Display vitals if collected */}
      {vitals && (
        <div className="mt-6 p-4 border rounded-md bg-gray-100">
          <h2 className="text-lg font-semibold">Collected Vitals:</h2>
          <p>Temperature: {vitals.temperature} °C</p>
          <p>Heart Rate: {vitals.heart_rate} bpm</p>
          {/* Add other vitals if available */}
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default PatientVitals;