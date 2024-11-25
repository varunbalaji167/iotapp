import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";
import TempVitals from "../Vitals/TempVitals";
import OximeterVitals from "../Vitals/OximeterVitals";
import GlucoseVitals from "../Vitals/GlucoseVitals";
import BPVitals from "../Vitals/BPVitals";
import HeightVitals from "../Vitals/HeightVitals";
import WeightVitals from "../Vitals/WeightVitals";

const DoctorVitals = () => {
  const { userRole } = useAuth();
  const [profileExists, setProfileExists] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [hardwareConfigured, setHardwareConfigured] = useState(false);

  const [loadingt, setLoadingT] = useState(false);
  const [loadingo, setLoadingO] = useState(false);
  const [loadingb, setLoadingB] = useState(false);
  const [loadingh, setLoadingH] = useState(false);
  const [loadingw, setLoadingW] = useState(false);
  const [loadingg, setLoadingG] = useState(false);

  const [socket, setSocket] = useState(null);
  const [statusMessaget, setStatusMessageT] = useState("");
  const [statusMessageo, setStatusMessageO] = useState("");
  const [statusMessageb, setStatusMessageB] = useState("");
  const [statusMessageh, setStatusMessageH] = useState("");
  const [statusMessagew, setStatusMessageW] = useState("");
  const [statusMessageg, setStatusMessageG] = useState("");

  const [sensorErrorPromptt, setSensorErrorPromptT] = useState(false);
  const [sensorErrorPrompto, setSensorErrorPromptO] = useState(false);
  const [sensorErrorPromptb, setSensorErrorPromptB] = useState(false);
  const [sensorErrorPromptg, setSensorErrorPromptG] = useState(false);
  const [sensorErrorPrompth, setSensorErrorPromptH] = useState(false);
  const [sensorErrorPromptw, setSensorErrorPromptW] = useState(false);

  const [temperature, setTemperature] = useState(null);
  const [spo2, setSPO2] = useState(null);
  const [heart_rate, setHeart_Rate] = useState(null);
  const [glucose, setGlucose] = useState(null);
  const [sys, setSys] = useState(null);
  const [dia, setDia] = useState(null);
  const [heart_rate_bp, setHeartRateBP] = useState(null);
  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);

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
        "https://147.79.67.165:8000/api/users/refresh/",
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
        "https://147.79.67.165:8000/api/users/doctorvitals/",
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
      await axios.get("https://147.79.67.165:8000/api/users/doctorprofile/", {
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
        "https://147.79.67.165:8000/api/users/devices/",
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
    if (userRole === "doctor") {
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

  const fetchTemperature = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = { Authorization: "Bearer " + token.access };

    try {
      console.log(userRole);
      const response = await axios.get(
        `https://147.79.67.165:8000/api/users/${userRole}vitals`,
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
        console.error("Response data is not in the expected format.");
      }
    } catch (error) {
      console.error(
        `Error fetching temperature: ${
          error.response?.data?.detail || error.message
        }`
      );
      toast.error(
        `Error fetching temperature: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoadingT(false);
    }
    setLoadingT(false);
  };

  const fetchOximeter = async () => {
    console.log("called fetchoximeter");
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = { Authorization: "Bearer " + token.access };

    try {
      console.log(userRole);
      const response = await axios.get(
        `https://147.79.67.165:8000/api/users/${userRole}vitals`,
        { headers }
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        const spo2Data = response.data[0];
        const heart_rateData = response.data[0];
        if (
          spo2Data.spo2 !== undefined &&
          heart_rateData.heart_rate !== undefined
        ) {
          setHeart_Rate(heart_rateData.heart_rate);
          setSPO2(spo2Data.spo2);
        } else {
          console.error(
            "Spo2 and Heart Rate fields are missing from the response."
          );
        }
      } else {
        console.error(
          "Spo2 or Heart Rate data is missing or not in the expected format."
        );
      }
    } catch (error) {
      toast.error(
        `Error fetching Oximeter Vitals: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      // setLoadingO(false);
    }
    setLoadingO(false);
  };

  const fetchBP = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = { Authorization: "Bearer " + token.access };
    setLoadingB(true);

    try {
      console.log(userRole);
      const response = await axios.get(
        `https://147.79.67.165:8000/api/users/${userRole}vitals`,
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
    }
    setLoadingB(false);
  };

  const fetchGlucose = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = { Authorization: "Bearer " + token.access };
    setLoadingG(true);

    try {
      const response = await axios.get(
        `https://147.79.67.165:8000/api/users/${userRole}vitals`,
        { headers }
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        const glucoseData = response.data[0];
        if (glucoseData.glucose_level !== undefined) {
          setGlucose(glucoseData.glucose_level);
        } else {
          console.error("Glucose field is missing from the response.");
        }
      } else {
        console.error("Response data is not in the expected format.");
      }
    } catch (error) {
      console.error(
        `Error fetching glucose: ${
          error.response?.data?.detail || error.message
        }`
      );
      toast.error(
        `Error fetching glucose: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoadingG(false);
    }
  };

  const fetchHeight = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = { Authorization: "Bearer " + token.access };
    setLoadingH(true);

    try {
      console.log(userRole);
      const response = await axios.get(
        `https://147.79.67.165:8000/api/users/${userRole}vitals`,
        { headers }
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        const heightData = response.data[0];
        if (heightData.height !== undefined) {
          setHeight(heightData.height);
        } else {
          console.error("Height field is missing from the response.");
        }
      } else {
        console.error("Response data is not in the expected format.");
      }
    } catch (error) {
      console.error(
        `Error fetching height: ${
          error.response?.data?.detail || error.message
        }`
      );
      toast.error(
        `Error fetching height: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoadingH(false);
    }
  };

  const fetchWeight = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !token.access) return;

    const headers = { Authorization: "Bearer " + token.access };
    setLoadingW(true);

    try {
      console.log(userRole);
      const response = await axios.get(
        `https://147.79.67.165:8000/api/users/${userRole}vitals`,
        { headers }
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        const weightData = response.data[0];
        if (weightData.weight !== undefined) {
          setWeight(weightData.weight);
        } else {
          console.error("Weight field is missing from the response.");
        }
      } else {
        console.error("Response data is not in the expected format.");
      }
    } catch (error) {
      console.error(
        `Error fetching weight: ${
          error.response?.data?.detail || error.message
        }`
      );
      toast.error(
        `Error fetching weight: ${
          error.response?.data?.detail || error.message
        }`
      );
    } finally {
      setLoadingW(false);
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
      `ws://147.79.67.165:8000/ws/vitals/?device_id=${deviceId}&token=${token.access}`
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
      hiInterval = setInterval(sendHiMessage, 45000); // 1.5 minutes
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket data:", data);

      // Clear timeout if we received the "Hi" response
      if (data.Status === "Hi") {
        clearTimeout(hiResponseTimeout);
        // setStatusMessage("Hardware Configured");
        setHardwareConfigured(true);
        // setSensorErrorPrompt(false);
      } else if (data.Status === "Sensor Initialized Successfully") {
        clearTimeout(hiResponseTimeout);

        if (data.Subject == "Temperature") {
          setStatusMessageT("Temperature Sensor Initialized");
          setSensorErrorPromptT(false);
        } else if (data.Subject == "Oximeter") {
          setStatusMessageO("Oximeter Sensor Initialized");
          setSensorErrorPromptO(false);
        } else if (data.Subject == "BP") {
          setStatusMessageB("BP Sensor Initialized");
          setSensorErrorPromptB(false);
        } else if (data.Subject == "Glucose") {
          setStatusMessageG("Glucose Sensor Initialized");
          setSensorErrorPromptG(false);
        } else if (data.Subject == "Height") {
          setStatusMessageH("Height Sensor Initialized");
          setSensorErrorPromptH(false);
        } else if (data.Subject == "Weight") {
          setStatusMessageW("Weight Sensor Initialized");
          setSensorErrorPromptW(false);
        }
      } else if (data.Status === "Sensor Initialization Failed") {
        clearTimeout(hiResponseTimeout);
        if (data.Subject == "Temperature") {
          setStatusMessageT("Sensor Initialization Failed");
          handleSkipT();
        } else if (data.Subject == "Oximeter") {
          setStatusMessageO("Sensor Initialization Failed");
          handleSkipO();
        } else if (data.Subject == "BP") {
          setStatusMessageB("Sensor Initialization Failed");
          handleSkipB();
        } else if (data.Subject == "Glucose") {
          setStatusMessageG("Sensor Initialization Failed");
          handleSkipG();
        } else if (data.Subject == "Height") {
          setStatusMessageH("Sensor Initialization Failed");
          handleSkipH();
        } else if (data.Subject == "Weight") {
          setStatusMessageW("Sensor Initialization Failed");
          handleSkipW();
        }
        toast.error("Sensor Initialization Failed. Skipping...");
      } else if (data.Status === "Result Calculated") {
        clearTimeout(hiResponseTimeout);
        if (data.Subject == "Temperature") {
          fetchTemperature();
          setStatusMessageT("Reading Complete");
          setSensorErrorPromptT(false);
        }
        if (data.Subject == "Oximeter") {
          setStatusMessageO("Reading Complete");
          setSensorErrorPromptO(false);
          fetchOximeter();
        }
        if (data.Subject == "BP") {
          setStatusMessageB("Reading Complete");
          setSensorErrorPromptB(false);
          fetchBP();
        }
        if (data.Subject == "Glucose") {
          setStatusMessageG("Reading Complete");
          setSensorErrorPromptG(false);
          fetchGlucose();
        }
        if (data.Subject == "Height") {
          setStatusMessageH("Reading Complete");
          setSensorErrorPromptH(false);
          fetchHeight();
        }
        if (data.Subject == "Weight") {
          setStatusMessageW("Reading Complete");
          setSensorErrorPromptW(false);
          fetchWeight();
        }
      } else if (data.Status === "Calculating") {
        clearTimeout(hiResponseTimeout);
        if (data.Subject == "Temperature") {
          setStatusMessageT("Calculating");
          setSensorErrorPromptT(false);
        }
        if (data.Subject == "Oximeter") {
          setStatusMessageO("Calculating");
          setSensorErrorPromptO(false);
        }
        if (data.Subject == "BP") {
          setStatusMessageB("Calculating");
          setSensorErrorPromptB(false);
        }
        if (data.Subject == "Glucose") {
          setStatusMessageG("Calculating");
          setSensorErrorPromptG(false);
        }
        if (data.Subject == "Height") {
          setStatusMessageH("Calculating");
          setSensorErrorPromptH(false);
        }
        if (data.Subject == "Weight") {
          setStatusMessageW("Calculating");
          setSensorErrorPromptW(false);
        }
      } else if (data.Status === "Sensor Reading Failed") {
        clearTimeout(hiResponseTimeout);
        if (data.Subject == "Temperature") {
          setStatusMessageT("Please place your Finger properly.");
          setSensorErrorPromptT(true);
          setLoadingT(false);
        }
        if (data.Subject == "Oximeter") {
          setStatusMessageO("Please place your Finger properly.");
          setSensorErrorPromptO(true);
          setLoadingO(false);
        }
        if (data.Subject == "BP") {
          setStatusMessageB("Please wear your BP Cuff Properly and place your Wrist at Heart Level");
          setSensorErrorPromptB(true);
          setLoadingB(false);
        }
        if (data.Subject == "Glucose") {
          setStatusMessageG("Please place your Finger properly.");
          setSensorErrorPromptG(true);
          setLoadingG(false);
        }
        if (data.Subject == "Height") {
          setStatusMessageH("Sensor Reading Failed");
          setSensorErrorPromptH(true);
          setLoadingH(false);
        }
        if (data.Subject == "Weight") {
          setStatusMessageW("Sensor Reading Failed");
          setSensorErrorPromptW(true);
          setLoadingW(null);
        }
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
      setLoadingT(true);
    } else {
      toast.warn(
        "Cannot request temperature. Ensure the hardware is configured."
      );
    }
  };

  const requestOximeter = () => {
    if (socket && hardwareConfigured) {
      socket.send(JSON.stringify({ message: "Oximeter" }));
      toast.info("Requesting Oximeter Vitals...");
      setLoadingO(true);
    } else {
      toast.warn(
        "Cannot request Oximeter Vitals. Ensure the hardware is configured."
      );
    }
  };

  const requestBP = () => {
    if (socket && hardwareConfigured) {
      socket.send(JSON.stringify({ message: "BP" }));
      toast.info("Requesting BP Vitals...");
      setLoadingB(true);
    } else {
      toast.warn(
        "Cannot request BP Vitals. Ensure the hardware is configured."
      );
    }
  };

  const requestGlucose = () => {
    if (socket && hardwareConfigured) {
      socket.send(JSON.stringify({ message: "Glucose" }));
      toast.info("Requesting glucose...");
      setLoadingG(true);
    } else {
      toast.warn("Cannot request glucose. Ensure the hardware is configured.");
    }
  };

  const requestHeight = () => {
    if (socket && hardwareConfigured) {
      socket.send(JSON.stringify({ message: "Height" }));
      toast.info("Requesting height...");
      setLoadingH(true);
    } else {
      toast.warn("Cannot request height. Ensure the hardware is configured.");
    }
  };

  const requestWeight = () => {
    if (socket && hardwareConfigured) {
      socket.send(JSON.stringify({ message: "Weight" }));
      toast.info("Requesting weight...");
      setLoadingW(true);
    } else {
      toast.warn("Cannot request weight. Ensure the hardware is configured.");
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
    setHardwareConfigured(false);

    setTemperature(null);
    setGlucose(null);
    setHeartRateBP(null);
    setHeart_Rate(null);
    setDia(null);
    setSPO2(null);
    setSys(null);
    setHeight(null);
    setWeight(null);

    setLoadingT(false);
    setLoadingO(false);
    setLoadingB(false);
    setLoadingG(false);
    setLoadingH(false);
    setLoadingW(false);

    setStatusMessageT("");
    setStatusMessageO("");
    setStatusMessageB("");
    setStatusMessageG("");
    setStatusMessageH("");
    setStatusMessageW("");

    setSensorErrorPromptT(false);
    setSensorErrorPromptG(false);
    setSensorErrorPromptO(false);
    setSensorErrorPromptB(false);
    setSensorErrorPromptH(false);
    setSensorErrorPromptW(false);
  };

  const handleRetryT = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "Temperature" }));

      setSensorErrorPromptT(false);
      setLoadingT(true);
    }
  };

  const handleSkipT = () => {
    setSensorErrorPromptT(false);
    setStatusMessageT("");
    setLoadingT(false);
    setTemperature(null);
  };

  const handleRetryO = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "Oximeter" }));

      setSensorErrorPromptO(false);
      setLoadingO(true);
    }
  };

  const handleSkipO = () => {
    setSensorErrorPromptO(false);
    setStatusMessageO("");
    setLoadingO(false);
    setHeart_Rate(null);
    setSPO2(null);
  };

  const handleRetryB = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "BP" }));

      setSensorErrorPromptB(false);
      setLoadingB(true);
    }
  };

  const handleSkipB = () => {
    setSensorErrorPromptB(false);
    setStatusMessageB("");
    setLoadingB(false);
    setHeartRateBP(null);
    setSys(null);
    setDia(null);
  };

  const handleRetryG = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "Glucose" }));

      setSensorErrorPromptG(false);
      setLoadingG(true);
    }
  };

  const handleSkipG = () => {
    setSensorErrorPromptG(false);
    setStatusMessageG("");
    setLoadingG(false);
    setGlucose(null);
  };

  const handleRetryH = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "Height" }));

      setSensorErrorPromptH(false);
      setLoadingH(true);
    }
  };

  const handleSkipH = () => {
    setSensorErrorPromptH(false);
    setStatusMessageH("");
    setLoadingH(false);
    setHeight(null);
  };

  const handleRetryW = () => {
    if (socket) {
      socket.send(JSON.stringify({ message: "Weight" }));

      setSensorErrorPromptW(false);
      setLoadingW(true);
    }
  };

  const handleSkipW = () => {
    setSensorErrorPromptW(false);
    setStatusMessageW("");
    setLoadingW(false);
    setWeight(null);
  };

  // Show toast when hardware is configured
  useEffect(() => {
    if (hardwareConfigured) {
      toast.success("Hardware configured successfully!", {
        autoClose: 3000,
      });
    }
  }, [hardwareConfigured]);

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

          {/* Hardware Configured Indicator */}
          <div className="flex flex-col items-center mt-6">
            <div
              className={`w-6 h-6 rounded-full ${
                hardwareConfigured ? "bg-green-500" : "bg-red-500 animate-pulse"
              }`}
            ></div>
            <p className="mt-2 text-sm text-gray-600">
              {hardwareConfigured
                ? "Hardware Configured"
                : "Hardware Not Configured"}
            </p>
          </div>
          <div className="flex justify-center">
            {!profileExists ? (
              <p className="text-lg text-gray-600">
                Please create your profile to continue.
              </p>
            ) : (
              <>
                {/* Connect/Disconnect Button */}
                <div className="flex justify-center mt-6">
                  {!connected ? (
                    <button
                      onClick={handleConnect}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      Connect
                    </button>
                  ) : (
                    <button
                      onClick={disconnectSocket1}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-md transition duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </>
            )}
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
                requestTemperature={requestTemperature}
                handleConnect={handleConnect}
                disconnectSocket={disconnectSocket}
                disconnectSocket1={disconnectSocket1}
                handleRetry={handleRetryT}
                handleSkip={handleSkipT}
                hardwareConfigured={hardwareConfigured}
                sensorErrorPromptt={sensorErrorPromptt}
                statusMessaget={statusMessaget}
                connected={connected}
                loadingt={loadingt}
                setLoadingT={setLoadingT}
                setStatusMessageT={setStatusMessageT}
                temperature={temperature}
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
                requestOximeter={requestOximeter}
                handleConnect={handleConnect}
                disconnectSocket={disconnectSocket}
                disconnectSocket1={disconnectSocket1}
                handleRetry={handleRetryO}
                handleSkip={handleSkipO}
                hardwareConfigured={hardwareConfigured}
                sensorErrorPrompto={sensorErrorPrompto}
                statusMessageo={statusMessageo}
                setStatusMessageO={setStatusMessageO}
                connected={connected}
                loadingo={loadingo}
                setLoadingO={setLoadingO}
                heart_rate={heart_rate}
                spo2={spo2}
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
                requestGlucose={requestGlucose}
                handleConnect={handleConnect}
                disconnectSocket={disconnectSocket}
                disconnectSocket1={disconnectSocket1}
                handleRetry={handleRetryG}
                handleSkip={handleSkipG}
                hardwareConfigured={hardwareConfigured}
                sensorErrorPromptg={sensorErrorPromptg}
                statusMessageg={statusMessageg}
                connected={connected}
                loadingg={loadingg}
                setLoadingG={setLoadingG}
                setStatusMessageG={setStatusMessageG}
                glucose={glucose}
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
                requestBP={requestBP}
                handleConnect={handleConnect}
                disconnectSocket={disconnectSocket}
                disconnectSocket1={disconnectSocket1}
                handleRetry={handleRetryB}
                handleSkip={handleSkipB}
                hardwareConfigured={hardwareConfigured}
                sensorErrorPromptb={sensorErrorPromptb}
                statusMessageb={statusMessageb}
                connected={connected}
                loadingb={loadingb}
                setLoadingB={setLoadingB}
                setStatusMessageB={setStatusMessageB}
                sys={sys}
                dia={dia}
                heart_rate_bp={heart_rate_bp}
              />
            </div>

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
                    requestHeight={requestHeight}
                    handleConnect={handleConnect}
                    disconnectSocket={disconnectSocket}
                    disconnectSocket1={disconnectSocket1}
                    handleRetry={handleRetryH}
                    handleSkip={handleSkipH}
                    hardwareConfigured={hardwareConfigured}
                    sensorErrorPrompth={sensorErrorPrompth}
                    statusMessageh={statusMessageh}
                    connected={connected}
                    loadingh={loadingh}
                    setLoadingH={setLoadingH}
                    setStatusMessageH={setStatusMessageH}
                    height={height}
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
                    requestWeight={requestWeight}
                    handleConnect={handleConnect}
                    disconnectSocket={disconnectSocket}
                    disconnectSocket1={disconnectSocket1}
                    handleRetry={handleRetryW}
                    handleSkip={handleSkipW}
                    hardwareConfigured={hardwareConfigured}
                    sensorErrorPromptw={sensorErrorPromptw}
                    statusMessagew={statusMessagew}
                    connected={connected}
                    loadingw={loadingw}
                    setLoadingW={setLoadingW}
                    setStatusMessageW={setStatusMessageW}
                    weight={weight}
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

export default DoctorVitals;
