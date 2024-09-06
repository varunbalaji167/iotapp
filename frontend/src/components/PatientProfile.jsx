// // src/components/PatientProfile.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import Webcam from "react-webcam";

// const PatientProfile = () => {
//   const [profile, setProfile] = useState({
//     name: "",
//     dob: "",
//     blood_group: "",
//     height: "",
//     weight: "",
//     profile_picture: null,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [isProfileCreated, setIsProfileCreated] = useState(false);
//   const { userRole } = useAuth();
//   const webcamRef = useRef(null);
//   const [capturedImage, setCapturedImage] = useState(null);

//   // Fetch existing profile data on component mount
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         // Simulate fetching profile data
//         // const response = await axiosInstance.get("/profile/");
//         // Process response data
//       } catch (error) {
//         console.error("Error fetching profile:", error.response ? error.response.data : error.message);
//         if (error.response && error.response.status === 404) {
//           setIsProfileCreated(false);
//         } else {
//           setError("Error fetching profile data.");
//         }
//       }
//     };

//     if (userRole === "patient") {
//       fetchProfile();
//     }
//   }, [userRole]);

//   // Capture image from webcam
//   const captureImage = () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     setCapturedImage(imageSrc);
//   };

//   // Handle form submission to update or create the profile
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     const formData = new FormData();
//     for (const [key, value] of Object.entries(profile)) {
//       formData.append(key, value);
//     }

//     // Add the captured image or selected profile picture to the form data
//     if (capturedImage) {
//       (async () => {
//         const blob = await (await fetch(capturedImage)).blob(); // Convert base64 to Blob
//         formData.append("profile_picture", blob, "profile_picture.jpg");
//         // Log formData for debugging
//         for (let pair of formData.entries()) {
//           console.log(pair[0] + ": " + pair[1]);
//         }
//         setLoading(false);
//         setSuccess(isProfileCreated ? "Profile updated successfully." : "Profile created successfully.");
//         setIsProfileCreated(true);
//       })();
//     } else if (profile.profile_picture) {
//       formData.append("profile_picture", profile.profile_picture);
//       // Log formData for debugging
//       for (let pair of formData.entries()) {
//         console.log(pair[0] + ": " + pair[1]);
//       }
//       setLoading(false);
//       setSuccess(isProfileCreated ? "Profile updated successfully." : "Profile created successfully.");
//       setIsProfileCreated(true);
//     } else {
//       // Log formData for debugging
//       for (let pair of formData.entries()) {
//         console.log(pair[0] + ": " + pair[1]);
//       }
//       setLoading(false);
//       setSuccess(isProfileCreated ? "Profile updated successfully." : "Profile created successfully.");
//       setIsProfileCreated(true);
//     }
//   };

//   // Handle input field changes
//   const handleChange = (e) => {
//     setProfile({ ...profile, [e.target.name]: e.target.value });
//   };

//   // Handle profile picture change
//   const handleFileChange = (e) => {
//     setProfile({ ...profile, profile_picture: e.target.files[0] });
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-4">
//       <h2 className="text-2xl font-bold mb-4">
//         {isProfileCreated ? "Update" : "Create"} Patient Profile
//       </h2>
//       {error && <p className="text-red-500">{error}</p>}
//       {success && <p className="text-green-500">{success}</p>}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Form fields */}
//         <div>
//           <label htmlFor="name" className="block text-sm font-medium">
//             Name
//           </label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             value={profile.name}
//             onChange={handleChange}
//             className="mt-1 block w-full p-2 border rounded-md"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="dob" className="block text-sm font-medium">
//             Date of Birth
//           </label>
//           <input
//             type="date"
//             id="dob"
//             name="dob"
//             value={profile.dob}
//             onChange={handleChange}
//             className="mt-1 block w-full p-2 border rounded-md"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="blood_group" className="block text-sm font-medium">
//             Blood Group
//           </label>
//           <input
//             type="text"
//             id="blood_group"
//             name="blood_group"
//             value={profile.blood_group}
//             onChange={handleChange}
//             className="mt-1 block w-full p-2 border rounded-md"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="height" className="block text-sm font-medium">
//             Height (cm)
//           </label>
//           <input
//             type="number"
//             id="height"
//             name="height"
//             value={profile.height}
//             onChange={handleChange}
//             className="mt-1 block w-full p-2 border rounded-md"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="weight" className="block text-sm font-medium">
//             Weight (kg)
//           </label>
//           <input
//             type="number"
//             id="weight"
//             name="weight"
//             value={profile.weight}
//             onChange={handleChange}
//             className="mt-1 block w-full p-2 border rounded-md"
//             required
//           />
//         </div>

//         {/* Webcam and profile picture handling */}
//         <div>
//           <label className="block text-sm font-medium">Profile Picture</label>
//           <Webcam
//             audio={false}
//             ref={webcamRef}
//             screenshotFormat="image/jpeg"
//             className="w-full mb-2"
//           />
//           <button
//             type="button"
//             onClick={captureImage}
//             className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
//           >
//             Capture Image
//           </button>
//           {capturedImage && (
//             <div>
//               <img src={capturedImage} alt="Captured" className="w-full" />
//             </div>
//           )}
//         </div>

//         <div>
//           <label htmlFor="profile_picture" className="block text-sm font-medium">
//             Or Upload Profile Picture
//           </label>
//           <input
//             type="file"
//             id="profile_picture"
//             name="profile_picture"
//             onChange={handleFileChange}
//             className="mt-1 block w-full"
//             accept="image/*"
//           />
//         </div>

//         <div>
//           <button
//             type="submit"
//             className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             disabled={loading}
//           >
//             {loading ? "Submitting..." : isProfileCreated ? "Update Profile" : "Create Profile"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PatientProfile;

// src/components/PatientProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Webcam from "react-webcam";
import axiosInstance from "../services/AxiosInstance"; // Import axiosInstance

const PatientProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    dob: "",
    blood_group: "",
    height: "",
    weight: "",
    profile_picture: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const { userRole } = useAuth();
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        setError("Authentication token is missing.");
        return;
      }
      
      let jwt_decode;
      try {
        jwt_decode = (await import('jwt-decode')).default;  // Dynamic import for jwt-decode
      } catch (error) {
        console.error('Failed to import jwt-decode:', error);
        setError("Failed to import jwt-decode library.");
        return;
      }

      const getTokenInfo = (token) => {
        try {
          return jwt_decode(token);  // Use the jwt_decode function here
        } catch (error) {
          console.error('Invalid token:', error);
          return null;
        }
      };
      
      const tokenInfo = getTokenInfo(token);
      
      if (!tokenInfo) {
        setError("Invalid authentication token.");
        return;
      }
      
      const now = Date.now() / 1000;
      if (tokenInfo.exp < now) {
        console.error('Token has expired');
        setError("Authentication token has expired. Please log in again.");
        return;
      }
      
      try {
        const response = await axiosInstance.get('/users/profile/');
        console.log("Profile data:", response.data);
        setProfile(response.data);
        setIsProfileCreated(true);
      } catch (error) {
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          setError(`Error fetching profile: ${error.response.data.detail || 'An error occurred'}`);
        } else {
          console.error('Error message:', error.message);
          setError(`Error fetching profile: ${error.message}`);
        }
      }
    };

    if (userRole === "patient") {
      fetchProfile();
    }
  }, [userRole]);

  // Capture image from webcam
  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  // Handle form submission to update or create the profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    for (const [key, value] of Object.entries(profile)) {
      formData.append(key, value);
    }

    if (capturedImage) {
      const blob = await (await fetch(capturedImage)).blob(); // Convert base64 to Blob
      formData.append("profile_picture", blob, "profile_picture.jpg");
    } else if (profile.profile_picture) {
      formData.append("profile_picture", profile.profile_picture);
    }

    try {
      if (isProfileCreated) {
        await axiosInstance.put('/users/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess("Profile updated successfully.");
      } else {
        await axiosInstance.post('/users/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess("Profile created successfully.");
        setIsProfileCreated(true);
      }
    } catch (error) {
      setError("Error submitting profile data.");
      console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle profile picture change
  const handleFileChange = (e) => {
    setProfile({ ...profile, profile_picture: e.target.files[0] });
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-4">
      <h2 className="text-2xl font-bold mb-4">
        {isProfileCreated ? "Update" : "Create"} Patient Profile
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
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
            value={profile.dob}
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
            value={profile.blood_group}
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
            value={profile.height}
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
            value={profile.weight}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Profile Picture</label>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full mb-2"
          />
          <button
            type="button"
            onClick={captureImage}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
          >
            Capture Image
          </button>
          {capturedImage && (
            <div>
              <img src={capturedImage} alt="Captured" className="w-full" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="profile_picture" className="block text-sm font-medium">
            Or Upload Profile Picture
          </label>
          <input
            type="file"
            id="profile_picture"
            name="profile_picture"
            onChange={handleFileChange}
            className="mt-1 block w-full"
            accept="image/*"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Submitting..." : isProfileCreated ? "Update Profile" : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;