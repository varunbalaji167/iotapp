import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TempVitals from "./TempVitals";
import OximeterVitals from "./OximeterVitals";

const DoctorVitals = () => {
  const { userRole } = useAuth();
  const [profileExists, setProfileExists] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const checkProfileExists = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token || !token.access) return;

      const headers = { Authorization: "Bearer " + token.access };

      try {
        await axios.get("http://127.0.0.1:8000/api/users/doctorprofile/", {
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

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Collect Your Vitals
      </h1>
      {!profileExists ? (
        <p className="text-lg text-gray-600">
          Please create your profile to continue.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <label
              htmlFor="deviceId"
              className="block text-lg font-semibold text-gray-700"
            >
              Device ID:
            </label>
            <select
              id="deviceId"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="mt-6">
              <TempVitals
                deviceId={deviceId}
                profileExists={profileExists}
                devices={devices}
                setProfileExists={setProfileExists}
                setDeviceId={setDeviceId}
                setDevices={setDevices}
              />
            </div>
            <div className="mt-6">
              <OximeterVitals
                deviceId={deviceId}
                profileExists={profileExists}
                devices={devices}
                setProfileExists={setProfileExists}
                setDeviceId={setDeviceId}
                setDevices={setDevices}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorVitals;
