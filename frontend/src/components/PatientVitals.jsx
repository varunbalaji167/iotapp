import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";

const PatientVitals = () => {
  const { userRole, userId } = useAuth(); // Assuming you have userId from auth context
  const [profileExists, setProfileExists] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);
  const [temperature, setTemperature] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [hardwareConfigured, setHardwareConfigured] = useState(false);
  const [sensorErrorPrompt, setSensorErrorPrompt] = useState(false);

  useEffect(() => {
    const checkProfileExists = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token || !token.access) return;

      const headers = { Authorization: "Bearer " + token.access };

      try {
        await axios.get("http://127.0.0.1:8000/api/users/patientprofile/", {
          headers,
        });
        setProfileExists(true);
      } catch (error) {
        if (error.response && error.response.status === 404) {
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

    checkProfileExists();
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token || !token.access) return;

      const headers = { Authorization: "Bearer " + token.access };

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/users/devices/",
          { headers }
        );
        setDevices(response.data);
        toast.success("Devices fetched successfully!");
      } catch (error) {
        toast.error(
          `Error fetching devices: ${
            error.response?.data?.detail || error.message
          }`
        );
      }
    };

    if (profileExists) {
      fetchDevices();
    }
  }, [profileExists]);

  const fetchTemperature = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = { Authorization: "Bearer " + token.access };
    setLoading(true);

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/users/patientvitals/",
        { headers }
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        const temperatureData = response.data[0];
        if (temperatureData.temperature !== undefined) {
          setTemperature(temperatureData.temperature);
        } else {
          console.error("Temperature field is missing from the response.");
        }
      } else {
        console.error(
          "Temperature data is missing or not in the expected format."
        );
      }
    } catch (error) {
      toast.error(
        `Error fetching temperature: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!deviceId) {
      toast.warn("Please select a device.");
      return;
    }

    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) {
      toast.error("Authentication token is missing.");
      return;
    }

    const newSocket = new WebSocket(
      `ws://127.0.0.1:8000/ws/vitals/?device_id=${deviceId}&token=${token.access}`
    );

    let hiResponseTimeout;
    let hiInterval;

    const sendHiMessage = () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.send(JSON.stringify({ message: "Hi" }));
        console.log("Sent 'Hi' to server");

        if (hiResponseTimeout) clearTimeout(hiResponseTimeout);

        hiResponseTimeout = setTimeout(() => {
          toast.error("Hardware not configured. Please refresh and connect again.");
          disconnectSocket();
        }, 10000);
      }
    };

    newSocket.onopen = () => {
      console.log("WebSocket connection established.");
      setConnected(true);
      toast.success("Connected to WebSocket!");
      sendHiMessage();
      hiInterval = setInterval(sendHiMessage, 120000);
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket data:", data);

      if (data.Status === "Hi") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Hardware Configured");
        setHardwareConfigured(true);
        setSensorErrorPrompt(false);
      } else if (data.Status === "Sensor initialized successfuly") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Temperature Sensor Initialized");
        setSensorErrorPrompt(false);
      } else if (data.Status === "Sensor Initialization Failed") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Sensor Initialization Failed");
        toast.error("Sensor Initialization Failed. Skipping...");
        handleSkip();
      } else if (data.Status === "Result Calculated") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Reading Complete");
        setSensorErrorPrompt(false);
        fetchTemperature();
      } else if (data.Status === "Calculating") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Calculating");
        setSensorErrorPrompt(false);
      } else if (data.Status === "Sensor Reading Failed") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Sensor Reading Failed");
        setSensorErrorPrompt(true);
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed.");
      resetConnectionState();
      toast.info("WebSocket connection closed.");
      clearInterval(hiInterval);
      clearTimeout(hiResponseTimeout);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      resetConnectionState();
      toast.error("Error with WebSocket connection.");
      clearInterval(hiInterval);
      clearTimeout(hiResponseTimeout);
    };

    setSocket(newSocket);
  };

  const requestTemperature = () => {
    if (socket && hardwareConfigured) {
      socket.send(JSON.stringify({ message: "Temperature" }));
      toast.info("Requesting temperature...");
      setLoading(true);
    } else {
      toast.warn(
        "Cannot request temperature. Ensure the hardware is configured."
      );
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.close();
    }
    resetConnectionState();
  };

  const resetConnectionState = () => {
    setSocket(null);
    setDeviceId("");
    setConnected(false);
    setLoading(false);
    setTemperature(null);
    setStatusMessage("");
    setHardwareConfigured(false);
    setSensorErrorPrompt(false);
  };

  const handleRetry = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "Temperature" }));
      setSensorErrorPrompt(false);
      setLoading(true);
    }
  };

  const handleSkip = () => {
    setSensorErrorPrompt(false);
    setStatusMessage("");
    setLoading(false);
    setTemperature(null);
  };

  const StatusMessage = ({ message }) => {
    let bgColor, textColor, Icon;

    switch (message) {
      case "Hardware Configured":
        bgColor = "bg-green-100 border-l-4 border-green-500";
        textColor = "text-green-800";
        Icon = FaCheckCircle;
        break;
      case "Temperature Sensor Initialized":
        bgColor = "bg-green-100 border-l-4 border-green-500";
        textColor = "text-green-800";
        Icon = FaCheckCircle;
        break;
      case "Sensor Initialization Failed":
      case "Sensor Reading Failed":
        bgColor = "bg-red-100 border-l-4 border-red-500";
        textColor = "text-red-800";
        Icon = FaTimesCircle;
        break;
      case "Reading Complete":
        bgColor = "bg-blue-100 border-l-4 border-blue-500";
        textColor = "text-blue-800";
        Icon = FaCheckCircle;
        break;
      case "Calculating":
        bgColor = "bg-yellow-100 border-l-4 border-yellow-500";
        textColor = "text-yellow-800";
        Icon = FaInfoCircle;
        break;
      default:
        bgColor = "bg-gray-100 border-l-4 border-gray-500";
        textColor = "text-gray-800";
        Icon = FaInfoCircle;
        break;
    }

    return (
      <div className={`transition-all duration-500 p-4 ${bgColor} ${textColor} flex items-center rounded-md shadow-sm space-x-3`}>
        <Icon className="text-xl" />
        <span className="font-medium text-sm">{message}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-xl px-6 py-8 bg-white rounded-lg shadow-lg mt-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Patient Vitals
      </h1>

      <div className="my-2">
        <label htmlFor="deviceSelect" className="text-sm font-medium text-gray-600">
          Select Device:
        </label>
        <select
          id="deviceSelect"
          className="block w-full mt-2 p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          <option value="" className="text-gray-400">Choose a device</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.device_name || device.device_id}
            </option>
          ))}
        </select>
      </div>

      {statusMessage && (
        <div className="mt-4">
          <StatusMessage message={statusMessage} />
        </div>
      )}

      <div className="mt-6 text-center">
        {connected ? (
          <>
            <button
              onClick={disconnectSocket}
              className="transition-all duration-300 px-4 py-2 bg-red-500 text-white font-semibold rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 mr-2"
            >
              Disconnect
            </button>
            {hardwareConfigured && (
              <button
                onClick={requestTemperature}
                className="transition-all duration-300 px-4 py-2 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                Request Temperature
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleConnect}
            className="transition-all duration-300 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Connect
          </button>
        )}
      </div>

      {sensorErrorPrompt && (
        <div className="my-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md text-red-800">
          <p className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            Sensor Error Occurred.
          </p>
          <div className="mt-2 space-x-2">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              Retry
            </button>
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center mt-6">
          <ClipLoader color="#4A90E2" loading={true} size={35} />
        </div>
      ) : (
        temperature !== null && (
          <p className="mt-6 text-xl font-semibold text-center text-gray-800">
            Temperature: <span className="text-blue-500">{temperature}°C</span>
          </p>
        )
      )}

      <ToastContainer />
    </div>
  );
};

export default PatientVitals;