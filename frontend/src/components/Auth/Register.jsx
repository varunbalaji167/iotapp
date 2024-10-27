// src/components/Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserShield,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa"; // Importing icons
import Swal from "sweetalert2"; // Import SweetAlert2

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords do not match!",
        timer: 2500, // Auto close after 2.5 seconds
        showConfirmButton: false,
        toast: true,
        position: "top-end", // Position it at the top right
        customClass: {
          popup: "alert-box", // You can add a custom class for additional styling
        },
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/register/",
        {
          username,
          email,
          password,
          confirm_password: confirmPassword,
          role,
        }
      );
      console.log("Registration successful", response.data);

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You can now log in!",
        timer: 1500, // Auto close after 1.5 seconds
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        customClass: {
          popup: "alert-box",
        },
      });

      navigate("/login");
    } catch (error) {
      console.error("Error registering user", error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text:
          error.response?.data?.detail ||
          "Registration failed. Please try again.",
        timer: 2500, // Auto close after 2.5 seconds
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        customClass: {
          popup: "alert-box",
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-900 font-semibold">Username</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <FaUser className="ml-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full p-3 focus:outline-none focus:bg-white focus:ring-0 placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <label className="text-gray-900 font-semibold">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <FaEnvelope className="ml-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="w-full p-3 focus:outline-none focus:bg-white focus:ring-0 placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <label className="text-gray-900 font-semibold">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <FaLock className="ml-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="new-password"
                className="w-full p-3 focus:outline-none focus:bg-white focus:ring-0 placeholder-gray-500"
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
          <div>
            <label className="text-gray-900 font-semibold">
              Confirm Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <FaLock className="ml-3" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                autoComplete="new-password"
                className="w-full p-3 focus:outline-none focus:bg-white focus:ring-0 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="mr-3 focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-900 font-semibold">Role</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <FaUserShield className="ml-3" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full p-3 focus:outline-none"
              >
                <option value="">Select Role</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2"
          >
            Register
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <button
            onClick={() => navigate("/login")}
            className="text-blue-500 hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
