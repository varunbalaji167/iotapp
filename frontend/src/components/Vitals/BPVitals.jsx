import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
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

const BPVitals = ({
  setDeviceId,
  deviceId,
  profileExists,
  devices,
  setProfileExists,
  setDevice,
}) => {
  const { userRole } = useAuth();
  const [sys, setSys] = useState(null);
  const [dia, setDia] = useState(null);
  const [heart_rate_bp, setHeartRateBP] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [hardwareConfigured, setHardwareConfigured] = useState(false);
  const [sensorErrorPrompt, setSensorErrorPrompt] = useState(false);

  const fetchBP = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = { Authorization: "Bearer " + token.access };
    setLoading(true);

    try {
      console.log(userRole);
      const response = await axios.get(
        `http://127.0.0.1:8000/api/users/${userRole}vitals`,
        { headers }
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        const sysData = response.data[0];
        const diaData = response.data[0];
        const heart_rate_bpData = response.data[0];
        if (
          sysData.sys !== undefined &&
          diaData.dia !== undefined &&
          heart_rate_bpData.heart_rate_bp !== undefined
        ) {
          setHeartRateBP(heart_rate_bpData.heart_rate_bp);
          setSys(sysData.sys);
          setDia(diaData.dia);
        } else {
          console.error(
            "Systolic,Diastolic Bp and Heart Rate fields are missing from the response."
          );
        }
      } else {
        console.error(
          "Systolic or Diastolic Bp or Heart Rate is missing or not in the expected format."
        );
      }
    } catch (error) {
      toast.error(
        `Error fetching BP Vitals: ${
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

        // Clear any previous timeout to avoid duplicates
        if (hiResponseTimeout) clearTimeout(hiResponseTimeout);

        // Set a 10-second timeout to check for the response
        hiResponseTimeout = setTimeout(() => {
          disconnectSocket(); // Optionally disconnect if no response
        }, 10000); // 10 seconds
      }
    };

    newSocket.onopen = () => {
      console.log("WebSocket connection established.");
      setConnected(true);
      toast.success("Connected to WebSocket!");

      // Send initial "Hi" message and set up interval to send every 1.5 minutes
      sendHiMessage();
      hiInterval = setInterval(sendHiMessage, 90000); // 1.5 minutes
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket data:", data);
      // Clear timeout if we received the "Hi" response
      if (data.Status === "Hi") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Hardware Configured");
        setHardwareConfigured(true);
        setSensorErrorPrompt(false);
      } else if (data.Status === "Sensor Initialized Successfully") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("BP Sensor Initialized");
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
        fetchBP();
      } else if (data.Status === "Calculating") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Calculating");
        setSensorErrorPrompt(false);
      } else if (data.Status === "Sensor Reading Failed") {
        clearTimeout(hiResponseTimeout);
        setStatusMessage("Please place your Finger properly.");
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
  const requestBP = () => {
    if (socket && hardwareConfigured) {
      socket.send(JSON.stringify({ message: "BP" }));
      toast.info("Requesting BP Vitals...");
      setLoading(true);
    } else {
      toast.warn(
        "Cannot request BP Vitals. Ensure the hardware is configured."
      );
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.close();
    }

    // Show toast message explaining why the page is reloading
    toast.error("Hardware Not Configured. Please Connect Again", {
      onClose: () => {
        // Reload the page after the toast message is shown
        window.location.reload();
      },
      autoClose: 2000, // Set the duration you want the toast to be displayed
    });
  };

  const disconnectSocket1 = () => {
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
    setHeartRateBP(null);
    setSys(null);
    setDia(null);
    setStatusMessage("");
    setHardwareConfigured(false);
    setSensorErrorPrompt(false);
  };

  const handleRetry = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "BP" }));
      setSensorErrorPrompt(false);
      setLoading(true);
    }
  };

  const handleSkip = () => {
    setSensorErrorPrompt(false);
    setStatusMessage("");
    setLoading(false);
    setHeartRateBP(null);
    setSys(null);
    setDia(null);
  };

  useEffect(() => {
    if (statusMessage === "Reading Complete") {
      const timer = setTimeout(() => setStatusMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const StatusMessage = ({ message }) => {
    let bgColor, textColor, Icon;

    switch (message) {
      case "Hardware Configured":
        bgColor = "bg-green-100 border-l-4 border-green-500";
        textColor = "text-green-800";
        Icon = FaCheckCircle;
        break;
      case "BP Sensor Initialized":
        bgColor = "bg-green-100 border-l-4 border-green-500";
        textColor = "text-green-800";
        Icon = FaCheckCircle;
        break;
      case "Sensor Initialization Failed":
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
      case "Please place your Finger properly.":
        bgColor = "bg-red-100 border-l-4 border-red-500";
        textColor = "text-red-800";
        Icon = FaTimesCircle;
        break;
      default:
        bgColor = "bg-gray-100 border-l-4 border-gray-500";
        textColor = "text-gray-800";
        Icon = FaTimesCircle;
        break;
    }

    return (
      <div
        className={`flex items-center p-4 my-4 rounded-lg shadow-md transition duration-300 ease-in-out ${bgColor} ${textColor}`}
      >
        <Icon className={`${textColor} mr-2`} size={20} />
        <p>{message}</p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      {/* Indicator for hardware configured state */}
      <div className="flex justify-center mb-4">
        <div
          className={`w-4 h-4 rounded-full ${
            hardwareConfigured ? "bg-green-500" : "bg-red-500 animate-blink"
          }`}
        ></div>
      </div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Calculate Your BP
      </h1>
      {!profileExists ? (
        <p className="text-lg text-gray-600">
          Please create your profile to continue.
        </p>
      ) : (
        <>
          <div className="mt-6">
            {!connected ? (
              <button
                onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 shadow-md"
              >
                Connect
              </button>
            ) : (
              <button
                onClick={disconnectSocket1}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 shadow-md"
              >
                Disconnect
              </button>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700">
              Collect Vitals:
            </h2>
            <button
              onClick={requestBP}
              disabled={!connected || loading || !hardwareConfigured}
              className={`mt-2 py-2 px-6 rounded-md shadow-md transition duration-300 text-white ${
                !connected || loading || !hardwareConfigured
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loading ? <ClipLoader color="#fff" size={20} /> : "Request BP"}
            </button>
          </div>

          {statusMessage && <StatusMessage message={statusMessage} />}

          {sensorErrorPrompt && (
            <div className="mt-4 flex">
              <button
                onClick={handleRetry}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md mr-2 shadow-md transition duration-300"
              >
                Retry
              </button>
              <button
                onClick={handleSkip}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
              >
                Skip
              </button>
            </div>
          )}

          {heart_rate_bp && sys && dia && (
            <p className="mt-6 text-lg text-gray-800">
              Heart Rate:{" "}
              <span className="font-bold text-blue-600">
                {heart_rate_bp} bpm{" "}
              </span>
              Systolic BP:{" "}
              <span className="font-bold text-blue-600"> {sys} (mmHg) </span>
              Diastolic BP:{" "}
              <span className="font-bold text-blue-600"> {dia} (mmHg) </span>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default BPVitals;
