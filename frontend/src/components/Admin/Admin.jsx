import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Admin = () => {
  const [formData, setFormData] = useState({
    device_id: "",
    device_type: "",
    owner_name: "",
    owner_phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Schedule token refresh before expiration
  const scheduleTokenRefresh = (expiresIn) => {
    const timeout = expiresIn - 60; // Refresh 1 minute before expiration
    setTimeout(async () => {
      await handleTokenRefresh(); // Call the refresh function
    }, timeout * 1000);
  };

  // Handle token refresh
  const handleTokenRefresh = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    const refreshToken = token?.refresh;

    if (!refreshToken) {
      setError("Refresh token is missing.");
      return;
    }

    try {
      const response = await axios.post("https://147.79.67.165:8000/api/users/refresh/", {
        refresh: refreshToken,
      });

      // Update tokens in localStorage
      localStorage.setItem("token", JSON.stringify({
        access: response.data.access,
        refresh: refreshToken, // Keep the same refresh token
      }));

      const newAccessToken = response.data.access;
      const tokenInfo = jwtDecode(newAccessToken);
      const now = Date.now() / 1000;
      const expiresIn = tokenInfo.exp - now;

      scheduleTokenRefresh(expiresIn); // Schedule the next refresh
    } catch (error) {
      setError("Failed to refresh token. Please log in again.");
    }
  };

  // Initialize token handling
  const initTokenHandling = () => {
    const token = JSON.parse(localStorage.getItem("token"));
    let accessToken = token?.access;

    if (!accessToken) {
      setError("Authentication token is missing.");
      return;
    }

    const tokenInfo = jwtDecode(accessToken);
    const now = Date.now() / 1000;
    const expiresIn = tokenInfo.exp - now;

    if (expiresIn > 60) {
      // If the token is valid for more than 1 minute
      scheduleTokenRefresh(expiresIn); // Schedule token refresh
    } else {
      // Token about to expire, refresh immediately
      handleTokenRefresh();
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = JSON.parse(localStorage.getItem("token"));
    const accessToken = token?.access;

    if (!accessToken) {
      setError("Authentication token is missing.");
      return;
    }

    try {
      const response = await axios.post(
        "https://147.79.67.165:8000/api/users/devices/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Include the token in the request headers
          },
        }
      );
      setMessage("Device registered successfully!");
      setFormData({
        device_id: "",
        device_type: "",
        owner_name: "",
        owner_phone: "",
      });
    } catch (error) {
      console.error("Error registering device:", error);
      if (error.response) {
        setMessage(`Failed to register the device: ${error.response.data.error || 'Please try again.'}`);
      } else {
        setMessage("An error occurred. Please try again.");
      }
    }
  };

  // Effect to initialize token handling when the component mounts
  useEffect(() => {
    initTokenHandling();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Device Registration
        </h2>

        {error && (
          <p className="text-center text-red-500 mb-4">{error}</p>
        )}

        {message && (
          <p className="text-center text-green-500 mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="device_id"
              className="block text-gray-700 font-bold mb-2"
            >
              Device ID
            </label>
            <input
              type="text"
              id="device_id"
              name="device_id"
              value={formData.device_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="device_type"
              className="block text-gray-700 font-bold mb-2"
            >
              Device Type
            </label>
            <select
              id="device_type"
              name="device_type"
              value={formData.device_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select device type
              </option>
              <option value="Portable">Portable</option>
              <option value="Stationary">Stationary</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="owner_name"
              className="block text-gray-700 font-bold mb-2"
            >
              Owner Name
            </label>
            <input
              type="text"
              id="owner_name"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="owner_phone"
              className="block text-gray-700 font-bold mb-2"
            >
              Owner Phone
            </label>
            <input
              type="text"
              id="owner_phone"
              name="owner_phone"
              value={formData.owner_phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500"
          >
            Register Device
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;