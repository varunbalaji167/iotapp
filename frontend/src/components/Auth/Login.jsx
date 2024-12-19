// src/components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axiosInstance from "../../axiosInstance"
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"; // Importing icons
import Swal from "sweetalert2"; // Import SweetAlert2
import { Link, useLocation } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        "/login/",
        {
          username,
          password,
        }
      );
      const user = response.data.user;
      const token = response.data.token;
      console.log(token);
      localStorage.setItem("token", JSON.stringify(token)); // Store token
      login(user); // Use context to handle login and redirection

      // Show success alert with custom styling and auto-close
      Swal.fire({
        title: "Success!",
        text: "You have logged in successfully.",
        icon: "success",
        position: "top-end", // Position the alert at the top right
        showConfirmButton: false, // Hide the confirm button
        timer: 1300, // Auto-close after 1.3 seconds
        toast: true, // Display as a toast notification
        customClass: {
          popup: "rounded-lg p-2", // Rounded corners and padding for compactness
          title: "text-sm", // Smaller title font
          content: "text-xs", // Smaller content font
        },
        width: "300px", // Set a fixed width for a smaller rectangular shape
      });
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);

      // Show error alert with custom styling and auto-close
      Swal.fire({
        title: "Login Failed",
        text: "Invalid username or password. Please try again.",
        icon: "error",
        position: "top-end", // Position the alert at the top right
        showConfirmButton: false, // Hide the confirm button
        timer: 2500, // Auto-close after 2.5 seconds
        toast: true, // Display as a toast notification
        customClass: {
          popup: "rounded-lg p-2", // Rounded corners and padding for compactness
          title: "text-sm", // Smaller title font
          content: "text-xs", // Smaller content font
        },
        width: "300px", // Set a fixed width for a smaller rectangular shape
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-900 font-semibold">Username</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <FaUser className="ml-3" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 focus:outline-none focus:bg-white focus:ring-0 placeholder-gray-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-gray-900 font-semibold">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <FaLock className="ml-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 focus:outline-none focus:bg-white focus:ring-0 placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="mr-3 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
          <div className="mt-2">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              onClick={() => navigate("/register")}
              className="text-blue-500 hover:underline"
            >
              Register here
            </button>
          </div>
          <Link to="/face" className="text-blue-600 font-semibold hover:underline">Use Face Auth</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
