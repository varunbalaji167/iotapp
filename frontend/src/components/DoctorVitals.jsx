// import React, { useState, useEffect } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ClipLoader } from "react-spinners";

// const DoctorVitals = () => {
//   const { userRole } = useAuth();
//   const [vitals, setVitals] = useState({});
//   const [deviceId, setDeviceId] = useState("");
//   const [devices, setDevices] = useState([]);
//   const [temperature, setTemperature] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Fetch devices on component mount
//   useEffect(() => {
//     const fetchDevices = async () => {
//       const token = JSON.parse(localStorage.getItem("token"));
//       if (!token || !token.access) return;

//       const headers = {
//         Authorization: "Bearer " + token.access,
//       };

//       try {
//         const response = await axios.get("http://127.0.0.1:8000/api/users/devices/", { headers });
//         setDevices(response.data);
//         toast.dismiss(); // Dismiss any existing success toast
//         toast.success("Devices fetched successfully!");
//       } catch (error) {
//         toast.dismiss(); // Dismiss any existing error toast
//         toast.error(`Error fetching devices: ${error.response?.data?.detail || error.message}`);
//       }
//     };

//     fetchDevices();
//   }, []);

//   // Fetch temperature from API
//   const fetchTemperature = async () => {
//     const token = JSON.parse(localStorage.getItem("token"));
//     if (!token || !token.access) return;

//     const headers = {
//       Authorization: "Bearer " + token.access,
//     };

//     setLoading(true); // Start loading
//     try {
//       const response = await axios.get("http://127.0.0.1:8000/api/users/doctorvitals/", { headers });
//       console.log("Temperature API response:", response.data);
      
//       if (Array.isArray(response.data) && response.data.length > 0) {
//         const temperatureData = response.data[0];
//         if (temperatureData.temperature !== undefined) {
//           setTemperature(temperatureData.temperature);
//           // Removed the toast notification for temperature
//         } else {
//           // Optional: handle case where temperature field is missing
//           console.error("Temperature field is missing from the response.");
//         }
//       } else {
//         // Optional: handle case where temperature data is missing
//         console.error("Temperature data is missing or not in the expected format.");
//       }
//     } catch (error) {
//       toast.dismiss(); // Dismiss any existing error toast
//       toast.error(`Error fetching temperature: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setLoading(false); // Stop loading
//     }
//   };

//   // Function to connect to WebSocket
//   const handleConnect = () => {
//     if (!deviceId) {
//       toast.dismiss(); // Dismiss any existing warning toast
//       toast.warn("Please select a device.");
//       return;
//     }

//     const token = JSON.parse(localStorage.getItem("token"));
//     if (!token || !token.access) {
//       toast.dismiss(); // Dismiss any existing error toast
//       toast.error("Authentication token is missing.");
//       return;
//     }

//     const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/vitals/?device_id=${deviceId}&token=${token.access}`);

//     newSocket.onopen = () => {
//       console.log("WebSocket connection established.");
//       setConnected(true);
//       toast.dismiss(); // Dismiss any existing success toast
//       toast.success("Connected to WebSocket!");
//     };

//     newSocket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("Received WebSocket data:", data);
      
//       if (data.Status === 'Reading Complete') {
//         fetchTemperature();
//       }
//     };

//     newSocket.onclose = () => {
//       console.log("WebSocket connection closed.");
//       setConnected(false);
//       setSocket(null);
//       toast.dismiss(); // Dismiss any existing info toast
//       toast.info("WebSocket connection closed.");
//     };

//     newSocket.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       toast.dismiss(); // Dismiss any existing error toast
//       toast.error("Error with WebSocket connection.");
//       setConnected(false);
//     };

//     setSocket(newSocket);
//   };

//   // Function to request temperature vital
//   const requestTemperature = () => {
//     if (socket) {
//       socket.send(JSON.stringify({ message: "Temperature" }));
//       toast.dismiss(); // Dismiss any existing info toast
//       toast.info("Requesting temperature...");
//       setLoading(true); // Start loading
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
//       <h1 className="text-3xl font-bold text-center mb-6">Doctor Vitals</h1>

//       <div className="mt-6">
//         <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 mb-2">
//           Select your Device ID:
//         </label>
//         <select
//           id="deviceId"
//           value={deviceId}
//           onChange={(e) => setDeviceId(e.target.value)}
//           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
//           required
//         >
//           <option value="" disabled>Select Device ID</option>
//           {devices.map((device) => (
//             <option key={device.device_id} value={device.device_id}>
//               {device.device_id} - {device.device_type} ({device.owner_name})
//             </option>
//           ))}
//         </select>
//         <button
//           onClick={handleConnect}
//           disabled={connected}
//           className={`mt-4 py-2 px-4 rounded-md ${connected ? 'bg-green-500' : 'bg-blue-500'} text-white hover:bg-opacity-80 transition duration-300`}
//         >
//           {connected ? "Connected" : "Connect"}
//         </button>
//       </div>

//       <div className="mt-6">
//         <h2 className="text-lg font-semibold">Collect Vitals:</h2>
//         <button
//           onClick={requestTemperature}
//           disabled={!connected || loading}
//           className={`mt-2 py-2 px-4 rounded-md ${!connected || loading ? 'bg-gray-300' : 'bg-blue-500'} text-white hover:bg-opacity-80 transition duration-300`}
//         >
//           {loading ? "Collecting..." : "Request Temperature"}
//         </button>
//         {loading && (
//           <div className="flex justify-center mt-2">
//             <ClipLoader color="#1D4ED8" loading={loading} size={30} />
//           </div>
//         )}
//       </div>

//       {temperature !== null && <p className="mt-4 text-xl font-bold">Temperature: {temperature} °C</p>}
      
//       <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
//     </div>
//   );
// };

// export default DoctorVitals;

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";

const DoctorVitals = () => {
  const { userRole } = useAuth();
  const [profileExists, setProfileExists] = useState(false); // State to track profile existence
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);
  const [temperature, setTemperature] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if the doctor profile exists on component mount
  useEffect(() => {
    const checkProfileExists = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token || !token.access) return;

      const headers = {
        Authorization: "Bearer " + token.access,
      };

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/doctorprofile/", { headers });
        setProfileExists(true); // Profile exists
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setProfileExists(false); // Profile does not exist
        } else {
          toast.error(`Error checking profile: ${error.response?.data?.detail || error.message}`);
        }
      }
    };

    checkProfileExists();
  }, []); // Add userRole to the dependency array if necessary

  // Fetch devices only if the profile exists
  useEffect(() => {
    const fetchDevices = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token || !token.access) return;

      const headers = {
        Authorization: "Bearer " + token.access,
      };

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/users/devices/", { headers });
        setDevices(response.data);
        toast.dismiss(); // Dismiss any existing success toast
        toast.success("Devices fetched successfully!");
      } catch (error) {
        toast.dismiss(); // Dismiss any existing error toast
        toast.error(`Error fetching devices: ${error.response?.data?.detail || error.message}`);
      }
    };

    if (profileExists) {
      fetchDevices();
    }
  }, [profileExists]); // Fetch devices only if the profile exists

  // Fetch temperature from API
  const fetchTemperature = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = {
      Authorization: "Bearer " + token.access,
    };

    setLoading(true); // Start loading
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/users/doctorvitals/", { headers });
      console.log("Temperature API response:", response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const temperatureData = response.data[0];
        if (temperatureData.temperature !== undefined) {
          setTemperature(temperatureData.temperature);
        } else {
          console.error("Temperature field is missing from the response.");
        }
      } else {
        console.error("Temperature data is missing or not in the expected format.");
      }
    } catch (error) {
      toast.dismiss(); // Dismiss any existing error toast
      toast.error(`Error fetching temperature: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to connect to WebSocket
  const handleConnect = () => {
    if (!deviceId) {
      toast.dismiss(); // Dismiss any existing warning toast
      toast.warn("Please select a device.");
      return;
    }

    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) {
      toast.dismiss(); // Dismiss any existing error toast
      toast.error("Authentication token is missing.");
      return;
    }

    const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/vitals/?device_id=${deviceId}&token=${token.access}`);

    newSocket.onopen = () => {
      console.log("WebSocket connection established.");
      setConnected(true);
      toast.dismiss(); // Dismiss any existing success toast
      toast.success("Connected to WebSocket!");
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket data:", data);
      
      if (data.Status === 'Reading Complete') {
        fetchTemperature();
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed.");
      setConnected(false);
      setSocket(null);
      toast.dismiss(); // Dismiss any existing info toast
      toast.info("WebSocket connection closed.");
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.dismiss(); // Dismiss any existing error toast
      toast.error("Error with WebSocket connection.");
      setConnected(false);
    };

    setSocket(newSocket);
  };

  // Function to request temperature vital
  const requestTemperature = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "Temperature" }));
      toast.dismiss(); // Dismiss any existing info toast
      toast.info("Requesting temperature...");
      setLoading(true); // Start loading
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Doctor Vitals</h1>
      
      {!profileExists && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          <p>Please create your profile to access the vitals functionality.</p>
        </div>
      )}

      {profileExists && (
        <>
          <div className="mt-6">
            <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 mb-2">
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
              onClick={handleConnect}
              disabled={connected}
              className={`mt-4 py-2 px-4 rounded-md ${connected ? 'bg-green-500' : 'bg-blue-500'} text-white hover:bg-opacity-80 transition duration-300`}
            >
              {connected ? "Connected" : "Connect"}
            </button>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Collect Vitals:</h2>
            <button
              onClick={requestTemperature}
              disabled={!connected || loading}
              className={`mt-2 py-2 px-4 rounded-md ${!connected || loading ? 'bg-gray-300' : 'bg-blue-500'} text-white hover:bg-opacity-80 transition duration-300`}
            >
              {loading ? "Collecting..." : "Request Temperature"}
            </button>
            {loading && (
              <div className="flex justify-center mt-2">
                <ClipLoader color="#1D4ED8" loading={loading} size={30} />
              </div>
            )}
          </div>

          {temperature !== null && <p className="mt-4 text-xl font-bold">Temperature: {temperature} °C</p>}
        </>
      )}
      
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default DoctorVitals;