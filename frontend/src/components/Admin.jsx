import React, { useState } from "react";
import axios from "axios";

const Admin = () => {
  const [formData, setFormData] = useState({
    device_id: "",
    device_type: "",
    owner_name: "",
    owner_phone: "",
  });

  const [message, setMessage] = useState("");

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
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/devices/",
        formData
      );
      setMessage("Device registered successfully!");
      setFormData({
        device_id: "",
        device_type: "",
        owner_name: "",
        owner_phone: "",
      });
    } catch (error) {
      console.error("Error registering device:", error); // This will log any error that occurs
      setMessage("Failed to register the device. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Device Registration
        </h2>

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
