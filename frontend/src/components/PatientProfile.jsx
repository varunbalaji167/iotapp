// // src/components/PatientProfile.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import Webcam from "react-webcam";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";

// const PatientProfile = () => {
//   const [profile, setProfile] = useState({
//     name: "",
//     dob: "",
//     blood_group: "",
//     height: "",
//     weight: "",
//     profile_picture: null,
//   });
  // const [newProfile, setNewProfile] = useState({});
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");
  // const [success, setSuccess] = useState("");
  // const [isProfileCreated, setIsProfileCreated] = useState(false);
  // const { userRole } = useAuth();
  // const webcamRef = useRef(null);
  // const [capturedImage, setCapturedImage] = useState(null);
  // const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProfile = async () => {
//       const token = JSON.parse(localStorage.getItem("token"));
//       if (!token) {
//         setError("Authentication token is missing.");
//         return;
//       }

//       const getTokenInfo = (token) => {
//         try {
//           return jwtDecode(token.access);
//         } catch (error) {
//           setError("Invalid authentication token.");
//           return null;
//         }
//       };

//       const tokenInfo = getTokenInfo(token);

//       if (!tokenInfo) {
//         setError("Invalid authentication token.");
//         return;
//       }

//       const now = Date.now() / 1000;
//       if (tokenInfo.exp < now) {
//         setError("Authentication token has expired. Please log in again.");
//         return;
//       }

//       try {
//         const response = await axios.get(
//           "http://127.0.0.1:8000/api/users/patientprofile/",
//           {
//             headers: {
//               Authorization: "Bearer " + token.access,
//             },
//           }
//         );
//         setProfile(response.data);
//         setIsProfileCreated(true);
//       } catch (error) {
//         if (error.response?.status === 404) {
//           setIsProfileCreated(false);
//         } else {
//           setError(
//             `Error fetching profile: ${
//               error.response?.data?.detail || error.message
//             }`
//           );
//         }
//       }
//     };

//     if (userRole === "patient") {
//       fetchProfile();
//     }
//   }, [userRole]);

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Webcam from "react-webcam";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const PatientProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    dob: "",
    blood_group: "",
    height: "",
    weight: "",
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
    <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-4">
      <h2 className="text-2xl font-bold mb-4">
        {isProfileCreated ? "Update" : "Create"} Patient Profile
        {profile.profile_picture && (
          <img
            src={
              profile.profile_picture.startsWith("data:image")
                ? profile.profile_picture
                : `http://127.0.0.1:8000${profile.profile_picture}`
            }
            alt="Current Profile"
            className="mb-2 rounded-full"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        )}
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={
              isProfileCreated ? newProfile?.name || profile.name : profile.name
            }
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium">
            Date of Birth
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={
              isProfileCreated ? newProfile?.dob || profile.dob : profile.dob
            }
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="blood_group" className="block text-sm font-medium">
            Blood Group
          </label>
          <input
            type="text"
            id="blood_group"
            name="blood_group"
            value={
              isProfileCreated
                ? newProfile?.blood_group || profile.blood_group
                : profile.blood_group
            }
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium">
            Height (cm)
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={
              isProfileCreated
                ? newProfile?.height || profile.height
                : profile.height
            }
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium">
            Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={
              isProfileCreated
                ? newProfile?.weight || profile.weight
                : profile.weight
            }
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Webcam section */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={300}
          height={200}
          className="border rounded-md"
        />
        {/* Preview of captured image */}
        {capturedImage && (
          <div>
            <h3>Preview of captured image</h3>
            <img
              src={capturedImage}
              alt="Captured"
              className="mb-2 rounded-md"
            />
          </div>
        )}
        <button
          type="button"
          onClick={captureImage}
          className="bg-blue-500 text-white py-2 px-4 rounded-md mt-2"
        >
          Capture Image
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-2"
        />

        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded-md"
        >
          {isProfileCreated ? "Update" : "Create"} Profile
        </button>
      </form>
    </div>
  );
};

export default PatientProfile;
