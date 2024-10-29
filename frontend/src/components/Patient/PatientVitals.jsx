// import React, { useState, useEffect } from "react";
// import { useAuth } from "../../contexts/AuthContext";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import TempVitals from "../Vitals/TempVitals";
// import OximeterVitals from "../Vitals/OximeterVitals";
// import GlucoseVitals from "../Vitals/GlucoseVitals";
// import BPVitals from "../Vitals/BPVitals";
// import HeightVitals from "../Vitals/HeightVitals";
// import WeightVitals from "../Vitals/WeightVitals";

// const PatientVitals = () => {
//   const { userRole } = useAuth();
//   const [profileExists, setProfileExists] = useState(false);
//   const [deviceId, setDeviceId] = useState("");
//   const [devices, setDevices] = useState([]);
//   const [error, setError] = useState(null);
//   let refreshTimeout;

//   const scheduleTokenRefresh = (expiresIn) => {
//     const timeout = (expiresIn - 60) * 1000; // Refresh 1 minute before expiration
//     refreshTimeout = setTimeout(async () => {
//       await handleTokenRefresh();
//     }, timeout);
//   };

//   const handleTokenRefresh = async () => {
//     const tokens = JSON.parse(localStorage.getItem("token"));
//     const refreshToken = tokens?.refresh;

//     if (!refreshToken) {
//       setError("Refresh token is missing.");
//       return;
//     }

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/users/refresh/",
//         {
//           refresh: refreshToken,
//         }
//       );

//       const newAccessToken = response.data.access;
//       localStorage.setItem(
//         "token",
//         JSON.stringify({
//           access: newAccessToken,
//           refresh: refreshToken,
//         })
//       );

//       const tokenInfo = jwtDecode(newAccessToken);
//       const now = Date.now() / 1000;
//       const expiresIn = tokenInfo.exp - now;

//       scheduleTokenRefresh(expiresIn);
//       fetchProfile(newAccessToken); // Fetch profile with new access token
//     } catch (error) {
//       console.error("Error refreshing token:", error.response?.data);
//       setError("Failed to refresh token. Please log in again.");
//     }
//   };

//   const initTokenHandling = () => {
//     const tokens = JSON.parse(localStorage.getItem("token"));
//     const accessToken = tokens?.access;

//     if (!accessToken) {
//       setError("Authentication tokens are missing.");
//       return;
//     }

//     const tokenInfo = jwtDecode(accessToken);
//     const now = Date.now() / 1000;
//     const expiresIn = tokenInfo.exp - now;

//     if (expiresIn > 60) {
//       scheduleTokenRefresh(expiresIn);
//       fetchProfile(accessToken);
//     } else {
//       handleTokenRefresh();
//     }
//   };

//   const fetchProfile = async (accessToken) => {
//     const headers = { Authorization: "Bearer " + accessToken };

//     try {
//       await axios.get("http://127.0.0.1:8000/api/users/patientprofile/", {
//         headers,
//       });
//       setProfileExists(true);
//     } catch (error) {
//       if (error.response?.status === 404) {
//         setProfileExists(false);
//       } else {
//         toast.error(
//           `Error checking profile: ${
//             error.response?.data?.detail || error.message
//           }`
//         );
//       }
//     }
//   };

//   const fetchDevices = async (accessToken) => {
//     const headers = { Authorization: "Bearer " + accessToken };

//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/users/devices/",
//         { headers }
//       );
//       setDevices(response.data);
//     } catch (error) {
//       toast.error(
//         `Error fetching devices: ${
//           error.response?.data?.detail || error.message
//         }`
//       );
//     }
//   };

//   useEffect(() => {
//     if (userRole === "patient") {
//       initTokenHandling();
//     }

//     // Clean up scheduled timeouts on component unmount
//     return () => clearTimeout(refreshTimeout);
//   }, [userRole]);

//   useEffect(() => {
//     const token = JSON.parse(localStorage.getItem("token"));
//     if (profileExists && token?.access) {
//       fetchDevices(token.access);
//     }
//   }, [profileExists]);

//   return (
//     <div className="p-6 md:p-8 lg:p-12 bg-white shadow-lg rounded-lg max-w-full mx-auto my-10">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
//         Collect Your Vitals
//       </h1>
//       {!profileExists ? (
//         <p className="text-lg text-gray-600 text-center">
//           Please create your profile to continue.
//         </p>
//       ) : (
//         <>
//           <div className="mt-4">
//             <label
//               htmlFor="deviceId"
//               className="block text-lg font-semibold text-gray-700 mb-2"
//             >
//               Device ID:
//             </label>
//             <select
//               id="deviceId"
//               value={deviceId}
//               onChange={(e) => setDeviceId(e.target.value)}
//               className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500 transition"
//               required
//             >
//               <option value="" disabled>
//                 Select Device ID
//               </option>
//               {devices.map((device) => (
//                 <option key={device.device_id} value={device.device_id}>
//                   {device.device_id}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mt-6">
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <TempVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <OximeterVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <GlucoseVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <BPVitals
// deviceId={deviceId}
// profileExists={profileExists}
// devices={devices}
// setProfileExists={setProfileExists}
// setDeviceId={setDeviceId}
// setDevices={setDevices}
//               />
//             </div>
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <HeightVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <WeightVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>
//           </div>
//         </>
//       )}
//       {error && <p className="text-red-600 text-center mt-4">{error}</p>}
//     </div>
//   );
// };

// export default PatientVitals;

// import React, { useState, useEffect } from "react";
// import { useAuth } from "../../contexts/AuthContext";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import TempVitals from "../Vitals/TempVitals";
// import OximeterVitals from "../Vitals/OximeterVitals";
// import GlucoseVitals from "../Vitals/GlucoseVitals";
// import BPVitals from "../Vitals/BPVitals";
// import HeightVitals from "../Vitals/HeightVitals";
// import WeightVitals from "../Vitals/WeightVitals";

// const PatientVitals = () => {
//   const { userRole } = useAuth();
//   const [profileExists, setProfileExists] = useState(false);
//   const [deviceId, setDeviceId] = useState("");
//   const [deviceType, setDeviceType] = useState("");
//   const [devices, setDevices] = useState([]);
//   const [error, setError] = useState(null);
//   const [bmi, setBmi] = useState(null);
//   let refreshTimeout;

//   const scheduleTokenRefresh = (expiresIn) => {
//     const timeout = (expiresIn - 60) * 1000; // Refresh 1 minute before expiration
//     refreshTimeout = setTimeout(async () => {
//       await handleTokenRefresh();
//     }, timeout);
//   };

//   const handleTokenRefresh = async () => {
//     const tokens = JSON.parse(localStorage.getItem("token"));
//     const refreshToken = tokens?.refresh;

//     if (!refreshToken) {
//       setError("Refresh token is missing.");
//       return;
//     }

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/users/refresh/",
//         {
//           refresh: refreshToken,
//         }
//       );

//       const newAccessToken = response.data.access;
//       localStorage.setItem(
//         "token",
//         JSON.stringify({
//           access: newAccessToken,
//           refresh: refreshToken,
//         })
//       );

//       const tokenInfo = jwtDecode(newAccessToken);
//       const now = Date.now() / 1000;
//       const expiresIn = tokenInfo.exp - now;

//       scheduleTokenRefresh(expiresIn);
//       fetchProfile(newAccessToken); // Fetch profile with new access token
//     } catch (error) {
//       console.error("Error refreshing token:", error.response?.data);
//       setError("Failed to refresh token. Please log in again.");
//     }
//   };

//   const initTokenHandling = () => {
//     const tokens = JSON.parse(localStorage.getItem("token"));
//     const accessToken = tokens?.access;

//     if (!accessToken) {
//       setError("Authentication tokens are missing.");
//       return;
//     }

//     const tokenInfo = jwtDecode(accessToken);
//     const now = Date.now() / 1000;
//     const expiresIn = tokenInfo.exp - now;

//     if (expiresIn > 60) {
//       scheduleTokenRefresh(expiresIn);
//       fetchProfile(accessToken);
//     } else {
//       handleTokenRefresh();
//     }
//   };

//   const fetchBmi = async (accessToken) => {
//     const headers = { Authorization: "Bearer " + accessToken };

//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/users/patientvitals/history/",
//         { headers }
//       );
//       // Assuming there's only one item in the response array
//       setBmi(response.data[0].bmi);
//     } catch (error) {
//       setError(
//         `Error fetching BMI: ${error.response?.data?.detail || error.message}`
//       );
//     }
//   };

//   const fetchProfile = async (accessToken) => {
//     const headers = { Authorization: "Bearer " + accessToken };

//     try {
//       await axios.get("http://127.0.0.1:8000/api/users/patientprofile/", {
//         headers,
//       });
//       setProfileExists(true);
//     } catch (error) {
//       if (error.response?.status === 404) {
//         setProfileExists(false);
//       } else {
//         toast.error(
//           `Error checking profile: ${
//             error.response?.data?.detail || error.message
//           }`
//         );
//       }
//     }
//   };

//   const fetchDevices = async (accessToken) => {
//     const headers = { Authorization: "Bearer " + accessToken };

//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/users/devices/",
//         { headers }
//       );
//       setDevices(response.data);
//     } catch (error) {
//       toast.error(
//         `Error fetching devices: ${
//           error.response?.data?.detail || error.message
//         }`
//       );
//     }
//   };

//   useEffect(() => {
//     if (userRole === "patient") {
//       initTokenHandling();
//     }

//     // Clean up scheduled timeouts on component unmount
//     return () => clearTimeout(refreshTimeout);
//   }, [userRole]);

//   useEffect(() => {
//     const token = JSON.parse(localStorage.getItem("token"));
//     if (profileExists && token?.access) {
//       fetchDevices(token.access);
//     }
//   }, [profileExists]);

//   const handleDeviceChange = (e) => {
//     const selectedDeviceId = e.target.value;
//     setDeviceId(selectedDeviceId);

//     // Find the selected device in the devices list and update the deviceType
//     const selectedDevice = devices.find(
//       (device) => device.device_id === selectedDeviceId
//     );
//     setDeviceType(selectedDevice?.device_type || "");
//   };

//   return (
//     <div className="p-6 md:p-8 lg:p-12 bg-white shadow-lg rounded-lg max-w-full mx-auto my-10">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
//         Collect Your Vitals
//       </h1>
//       {!profileExists ? (
//         <p className="text-lg text-gray-600 text-center">
//           Please create your profile to continue.
//         </p>
//       ) : (
//         <>
//           <div className="mt-4">
//             <label
//               htmlFor="deviceId"
//               className="block text-lg font-semibold text-gray-700 mb-2"
//             >
//               Device ID:
//             </label>
//             <select
//               id="deviceId"
//               value={deviceId}
//               onChange={handleDeviceChange}
//               className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500 transition"
//               required
//             >
//               <option value="" disabled>
//                 Select Device ID
//               </option>
//               {devices.map((device) => (
//                 <option key={device.device_id} value={device.device_id}>
//                   {device.device_id}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mt-6">
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <TempVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <OximeterVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <GlucoseVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>
//             <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//               <BPVitals
//                 deviceId={deviceId}
//                 profileExists={profileExists}
//                 devices={devices}
//                 setProfileExists={setProfileExists}
//                 setDeviceId={setDeviceId}
//                 setDevices={setDevices}
//               />
//             </div>

//             {/* Conditionally render Height and Weight vitals if deviceType is Stationary */}
//             {deviceType === "Stationary" && (
//               <>
//                 <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//                   <HeightVitals
//                     deviceId={deviceId}
//                     profileExists={profileExists}
//                     devices={devices}
//                     setProfileExists={setProfileExists}
//                     setDeviceId={setDeviceId}
//                     setDevices={setDevices}
//                   />
//                 </div>
//                 <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
//                   <WeightVitals
//                     deviceId={deviceId}
//                     profileExists={profileExists}
//                     devices={devices}
//                     setProfileExists={setProfileExists}
//                     setDeviceId={setDeviceId}
//                     setDevices={setDevices}
//                   />
//                 </div>
//               </>
//             )}
//             {bmi !== null ? (
//               <p className="text-2xl text-gray-700 text-center">
//                 Your BMI: {bmi}
//               </p>
//             ) : (
//               <p className="text-lg text-gray-600 text-center">
//                 Loading BMI...
//               </p>
//             )}
//             {error && <p className="text-red-600 text-center mt-4">{error}</p>}
//           </div>
//         </>
//       )}
//       {error && <p className="text-red-600 text-center mt-4">{error}</p>}
//     </div>
//   );
// };

// export default PatientVitals;


import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; // Fixed the import for jwtDecode
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TempVitals from "../Vitals/TempVitals";
import OximeterVitals from "../Vitals/OximeterVitals";
import GlucoseVitals from "../Vitals/GlucoseVitals";
import BPVitals from "../Vitals/BPVitals";
import HeightVitals from "../Vitals/HeightVitals";
import WeightVitals from "../Vitals/WeightVitals";

const PatientVitals = () => {
  const { userRole } = useAuth();
  const [profileExists, setProfileExists] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [bmi, setBmi] = useState(null);
  let refreshTimeout;

  const scheduleTokenRefresh = (expiresIn) => {
    const timeout = (expiresIn - 60) * 1000; // Refresh 1 minute before expiration
    refreshTimeout = setTimeout(async () => {
      await handleTokenRefresh();
    }, timeout);
  };

  const handleTokenRefresh = async () => {
    const tokens = JSON.parse(localStorage.getItem("token"));
    const refreshToken = tokens?.refresh;

    if (!refreshToken) {
      setError("Refresh token is missing.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/refresh/",
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem(
        "token",
        JSON.stringify({
          access: newAccessToken,
          refresh: refreshToken,
        })
      );

      const tokenInfo = jwtDecode(newAccessToken);
      const now = Date.now() / 1000;
      const expiresIn = tokenInfo.exp - now;

      scheduleTokenRefresh(expiresIn);
      await fetchProfile(newAccessToken); // Fetch profile with new access token
      await fetchBmi(newAccessToken); // Fetch BMI with new access token
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data);
      setError("Failed to refresh token. Please log in again.");
    }
  };

  const initTokenHandling = () => {
    const tokens = JSON.parse(localStorage.getItem("token"));
    const accessToken = tokens?.access;

    if (!accessToken) {
      setError("Authentication tokens are missing.");
      return;
    }

    const tokenInfo = jwtDecode(accessToken);
    const now = Date.now() / 1000;
    const expiresIn = tokenInfo.exp - now;

    if (expiresIn > 60) {
      scheduleTokenRefresh(expiresIn);
      fetchProfile(accessToken);
      fetchBmi(accessToken); // Fetch BMI when initializing if access token is valid
    } else {
      handleTokenRefresh();
    }
  };

  const fetchBmi = async (accessToken) => {
    const headers = { Authorization: "Bearer " + accessToken };

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/users/patientvitals/",
        { headers }
      );
      // Assuming there's only one item in the response array
      setBmi(response.data[0]?.bmi); // Check if the response has data before accessing
    } catch (error) {
      setError(
        `Error fetching BMI: ${error.response?.data?.detail || error.message}`
      );
    }
  };

  const fetchProfile = async (accessToken) => {
    const headers = { Authorization: "Bearer " + accessToken };

    try {
      await axios.get("http://127.0.0.1:8000/api/users/patientprofile/", {
        headers,
      });
      setProfileExists(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setProfileExists(false);
      } else {
        toast.error(
          `Error checking profile: ${
            error.response?.data?.detail || error.message
          }`
        );
      }
    }
  };

  const fetchDevices = async (accessToken) => {
    const headers = { Authorization: "Bearer " + accessToken };

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/users/devices/",
        { headers }
      );
      setDevices(response.data);
    } catch (error) {
      toast.error(
        `Error fetching devices: ${
          error.response?.data?.detail || error.message
        }`
      );
    }
  };

  useEffect(() => {
    if (userRole === "patient") {
      initTokenHandling();
    }

    // Clean up scheduled timeouts on component unmount
    return () => clearTimeout(refreshTimeout);
  }, [userRole]);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (profileExists && token?.access) {
      fetchDevices(token.access);
      fetchBmi(token.access); // Fetch BMI once profile is confirmed to exist
    }
  }, [profileExists]);

  const handleDeviceChange = (e) => {
    const selectedDeviceId = e.target.value;
    setDeviceId(selectedDeviceId);

    // Find the selected device in the devices list and update the deviceType
    const selectedDevice = devices.find(
      (device) => device.device_id === selectedDeviceId
    );
    setDeviceType(selectedDevice?.device_type || "");
  };

  return (
    <div className="p-6 md:p-8 lg:p-12 bg-white shadow-lg rounded-lg max-w-full mx-auto my-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Collect Your Vitals
      </h1>
      {!profileExists ? (
        <p className="text-lg text-gray-600 text-center">
          Please create your profile to continue.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <label
              htmlFor="deviceId"
              className="block text-lg font-semibold text-gray-700 mb-2"
            >
              Device ID:
            </label>
            <select
              id="deviceId"
              value={deviceId}
              onChange={handleDeviceChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500 transition"
              required
            >
              <option value="" disabled>
                Select Device ID
              </option>
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_id}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
              <TempVitals
                deviceId={deviceId}
                profileExists={profileExists}
                devices={devices}
                setProfileExists={setProfileExists}
                setDeviceId={setDeviceId}
                setDevices={setDevices}
              />
            </div>
            <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
              <OximeterVitals
                deviceId={deviceId}
                profileExists={profileExists}
                devices={devices}
                setProfileExists={setProfileExists}
                setDeviceId={setDeviceId}
                setDevices={setDevices}
              />
            </div>
            <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
              <GlucoseVitals
                deviceId={deviceId}
                profileExists={profileExists}
                devices={devices}
                setProfileExists={setProfileExists}
                setDeviceId={setDeviceId}
                setDevices={setDevices}
              />
            </div>
            <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
              <BPVitals
                deviceId={deviceId}
                profileExists={profileExists}
                devices={devices}
                setProfileExists={setProfileExists}
                setDeviceId={setDeviceId}
                setDevices={setDevices}
              />
            </div>

            {/* Conditionally render Height and Weight vitals if deviceType is Stationary */}
            {deviceType === "Stationary" && (
              <>
                <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
                  <HeightVitals
                    deviceId={deviceId}
                    profileExists={profileExists}
                    devices={devices}
                    setProfileExists={setProfileExists}
                    setDeviceId={setDeviceId}
                    setDevices={setDevices}
                  />
                </div>
                <div className="p-4 md:p-6 lg:p-8 bg-gray-50 rounded-lg shadow transition hover:shadow-lg mb-6">
                  <WeightVitals
                    deviceId={deviceId}
                    profileExists={profileExists}
                    devices={devices}
                    setProfileExists={setProfileExists}
                    setDeviceId={setDeviceId}
                    setDevices={setDevices}
                  />
                </div>
              </>
            )}
            {bmi !== null ? (
              <p className="text-2xl text-gray-700 text-center">
                Your Previously Calculated BMI: {bmi}
              </p>
            ) : (
              <p className="text-lg text-gray-600 text-center">
                BMI Not Calculated Previously
              </p>
            )}
            {error && <p className="text-red-600 text-center mt-4">{error}</p>}
          </div>
        </>
      )}
      {error && <p className="text-red-600 text-center mt-4">{error}</p>}
    </div>
  );
};

export default PatientVitals;