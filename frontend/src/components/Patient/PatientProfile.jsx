import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Webcam from "react-webcam";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PatientNavbar from "./PatientNavbar";
import { FaUser, FaCalendarAlt, FaTint, FaCamera, FaVenusMars } from "react-icons/fa";


const PatientProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    dob: "",
    blood_group: "",
    gender:"",
    profile_picture: null,
  });
  const [newProfile, setNewProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const { userRole } = useAuth();
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async (accessToken) => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/users/patientprofile/",
          {
            headers: {
              Authorization: "Bearer " + accessToken,
            },
          }
        );
        setProfile(response.data);
        setIsProfileCreated(true);
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data); // Log the error response
        if (error.response?.status === 404) {
          setIsProfileCreated(false);
        } else {
          setError(
            `Error fetching profile: ${error.response?.data?.detail || error.message}`
          );
        }
      }
    };
  
    const scheduleTokenRefresh = (expiresIn) => {
      const timeout = expiresIn - 60; // Refresh 1 minute before token expires
      setTimeout(async () => {
        await handleTokenRefresh(); // Call the refresh function
      }, timeout * 1000);
    };
  
    const handleTokenRefresh = async () => {
      const tokens = JSON.parse(localStorage.getItem("token"));
      const refreshToken = tokens?.refresh;
  
      if (!refreshToken) {
        setError("Refresh token is missing.");
        return;
      }
  
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/users/refresh/", {
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
  
        fetchProfile(newAccessToken); // Fetch profile with the new access token
      } catch (error) {
        console.error("Error refreshing token:", error.response?.data); // Log the error response
        setError("Failed to refresh token. Please log in again.");
      }
    };
  
    const initTokenHandling = () => {
      const tokens = JSON.parse(localStorage.getItem("token"));
      let accessToken = tokens?.access;
  
      if (!accessToken) {
        setError("Authentication tokens are missing.");
        return;
      }
  
      const tokenInfo = jwtDecode(accessToken);
      const now = Date.now() / 1000;
      const expiresIn = tokenInfo.exp - now;
  
      if (expiresIn > 60) {
        // If the token is valid for more than 1 minute
        scheduleTokenRefresh(expiresIn); // Schedule token refresh
        fetchProfile(accessToken); // Fetch profile with current access token
      } else {
        // Token about to expire, refresh immediately
        handleTokenRefresh();
      }
    };
  
    if (userRole === "patient") {
      initTokenHandling(); // Initialize token handling on component mount
    }
  
    // Clean up any scheduled timeouts on component unmount
    return () => clearTimeout();
  
  }, [userRole]);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const profileToSubmit = isProfileCreated ? newProfile : profile;

      // Add a default value for gender if it is empty
  if (!profileToSubmit.gender) {
    profileToSubmit.gender = "Male"; // Or any default value you prefer
  }
  
    if (profileToSubmit && typeof profileToSubmit === "object") {
      for (const [key, value] of Object.entries(profileToSubmit)) {
        formData.append(key, value);
      }

      if (capturedImage) {
        const imageBlob = base64ToBlob(capturedImage);
        formData.append("profile_picture", imageBlob, "profile_picture.jpeg");
      }

      if (profile.profile_picture instanceof File) {
        formData.append("profile_picture", profile.profile_picture);
      }

      try {
        const token = JSON.parse(localStorage.getItem("token"))?.access;
        if (!token) {
          throw new Error("No authorization token found.");
        }

        if (isProfileCreated) {
          await axios.put(
            "http://127.0.0.1:8000/api/users/patientprofile/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setSuccess("Profile updated successfully.");
          Swal.fire({
            icon: "success",
            title: "Profile Updated!",
            text: "Your profile has been updated successfully.",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            customClass: {
              popup: "alert-box",
            },
          }).then(() => {
            navigate("/patient"); // Redirect to the patient page
          });
        } else {
          await axios.post(
            "http://127.0.0.1:8000/api/users/patientprofile/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setSuccess("Profile created successfully.");
          Swal.fire({
            icon: "success",
            title: "Profile Created!",
            text: "Your profile has been created successfully.",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            customClass: {
              popup: "alert-box",
            },
          }).then(() => {
            navigate("/patient"); // Redirect to the patient page
          });
          setIsProfileCreated(true);
        }
      } catch (error) {
        console.error(
          "Error submitting profile:",
          error.response?.data || error.message
        );
        setError(
          "Error submitting profile: " +
            (error.response?.data?.detail || error.message)
        );
        Swal.fire({
          icon: "error",
          title: "Error!",
          text:
            error.response?.data?.detail ||
            "There was an issue submitting your profile.",
          timer: 2500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
          customClass: {
            popup: "alert-box",
          },
        });
      } finally {
        setLoading(false);
      }
    } else {
      setError("Profile data is invalid.");
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Profile data is invalid.",
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        customClass: {
          popup: "alert-box",
        },
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isProfileCreated) {
      setNewProfile({ ...newProfile, [name]: value });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    if (isProfileCreated) {
      setNewProfile({ ...newProfile, profile_picture: e.target.files[0] });
    } else {
      setProfile({ ...profile, profile_picture: e.target.files[0] });
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col">
      <PatientNavbar />
      <div className="container mx-auto p-6 md:p-12 flex-grow">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Complete Your Profile
        </h2>
        {profile.profile_picture && (
          <div className="flex justify-center mb-4">
            <img
              src={
                profile.profile_picture.startsWith("data:image")
                  ? profile.profile_picture
                  : `http://127.0.0.1:8000${profile.profile_picture}`
              }
              alt="Current Profile"
              className="rounded-full border-4 border-blue-300"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          {[
            { label: "Name", type: "text", name: "name", icon: FaUser },
            { label: "Date of Birth", type: "date", name: "dob", icon: FaCalendarAlt },
          ].map(({ label, type, name, icon: Icon }) => (
            <div key={name} className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                <Icon className="mr-2 text-gray-600" />
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
              </div>
              <input
                type={type}
                id={name}
                name={name}
                value={isProfileCreated ? newProfile?.[name] || profile[name] : profile[name]}
                onChange={handleChange}
                className="mt-1 block w-full md:w-2/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}
          {/* Blood Group Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
              <FaTint className="mr-2 text-gray-600" />
              <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700">
                Blood Group
              </label>
            </div>
            <select
              id="blood_group"
              name="blood_group"
              value={isProfileCreated ? newProfile?.blood_group || profile.blood_group : profile.blood_group}
              onChange={handleChange}
              className="mt-1 block w-full md:w-2/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select Blood Group
              </option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Gender Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
              <FaVenusMars className="mr-2 text-gray-600" />
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
            </div>
            <select
              id="gender"
              name="gender"
              value={isProfileCreated ? newProfile?.gender || profile.gender : profile.gender}
              onChange={handleChange}
              className="mt-1 block w-full md:w-2/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select your Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="flex flex-col items-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="border rounded-md mb-4 w-64 h-48 md:w-72 md:h-56"
            />
            {capturedImage && (
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium underline">Preview of Captured Image</h3>
                <img src={capturedImage} alt="Captured" className="border rounded-md mb-2 w-64 h-48 md:w-72 md:h-56 object-cover" />
              </div>
            )}
            <button
              type="button"
              onClick={captureImage}
              className="bg-blue-500 text-white py-2 px-4 rounded-md mt-2 flex items-center"
            >
              <FaCamera className="mr-2" />
              Capture Image
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:justify-between items-center mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md p-2 w-full md:w-1/2"
            />
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-green-500 transition duration-200 w-full md:w-1/2 lg:w-40 h-12"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;