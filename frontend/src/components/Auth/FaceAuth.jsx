// import React, { useState } from "react";
// import { useAuth } from "../../contexts/AuthContext";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { Link} from "react-router-dom";


// const FaceAuth = () => {
//   const [username, setUsername] = useState("");
//   const { login } = useAuth();

//   const handleFaceAuthentication = async () => {
//     try {
//       const faceResponse = await axios.post(
//         "http://127.0.0.1:8000/api/users/face-auth/",
//         { username } // Send username to verify face
//       );

//       if (faceResponse.data.face_auth === "Success") {
//         Swal.fire({
//           title: "Face Verified!",
//           text: "Your face has been authenticated successfully.",
//           icon: "success",
//           timer: 1500,
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//         });
//         // navigate("/dashboard"); // Redirect to the dashboard or main page
//       } else {
//         Swal.fire({
//           title: "Face Authentication Failed",
//           text: "Face does not match. Please try again.",
//           icon: "error",
//           timer: 2500,
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//         });
//       }
//     } catch (error) {
//       console.error("Face Authentication Error:", error.response?.data || error.message);
//       Swal.fire({
//         title: "Error",
//         text: "Face authentication could not be completed.",
//         icon: "error",
//         timer: 2500,
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//       });
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
//         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//           Login
//         </h2>
//         <form className="space-y-4">
          
          
//           <button
//             type="button"
//             onClick={handleFaceAuthentication}
//             className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2"
//           >
//             Login with Face Authentication
//           </button>
//         </form>
//         <div className="mt-4 text-center">
//           <div className="mt-2">
//           <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login Manually</Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FaceAuth;

// import React, { useState } from "react";
// import { useAuth } from "../../contexts/AuthContext";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { Link } from "react-router-dom";

// const FaceAuth = () => {
//   const [username, setUsername] = useState("");
//   const { login } = useAuth();

//   const handleFaceAuthentication = async (e) => {
//     e.preventDefault();
//     try {
//       const faceResponse = await axios.post(
//         "http://127.0.0.1:8000/api/users/face-auth/",
//         { username } // Send username to verify face
//       );

//       const { user, token } = faceResponse.data; // Destructure user and token
//       console.log(user); // Check what user data is returned
//       console.log(token); // Check the token returned

//       if (user && token) {
//         localStorage.setItem("token", JSON.stringify(token)); // Store token
//         login(user); // Use context to handle login and redirection

//         Swal.fire({
//           title: "Face Verified!",
//           text: "Your face has been authenticated successfully.",
//           icon: "success",
//           timer: 1500,
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//         });
//       } else {
//         Swal.fire({
//           title: "Face Authentication Failed",
//           text: "Face does not match. Please try again.",
//           icon: "error",
//           timer: 2500,
//           toast: true,
//           position: "top-end",
//           showConfirmButton: false,
//         });
//       }
//     } catch (error) {
//       console.error("Face Authentication Error:", error.response?.data || error.message);
//       Swal.fire({
//         title: "Error",
//         text: "Face authentication could not be completed.",
//         icon: "error",
//         timer: 2500,
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//       });
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
//         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//           Login
//         </h2>
//         <form className="space-y-4" onSubmit={handleFaceAuthentication}>
//           <button
//             type="submit"
//             className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2"
//           >
//             Login with Face Authentication
//           </button>
//         </form>
//         <div className="mt-4 text-center">
//           <div className="mt-2">
//             <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login Manually</Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FaceAuth;

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const FaceAuth = () => {
  const [username, setUsername] = useState("");
  const { login } = useAuth();
  const videoRef = useRef(null); // Reference for the video element

  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        Swal.fire({
          title: "Error",
          text: "Could not access webcam. Please check your permissions.",
          icon: "error",
          timer: 2500,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    };

    startVideoStream();

    return () => {
      // Clean up the video stream when the component unmounts
      const stream = videoRef.current?.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFaceAuthentication = async (e) => {
    e.preventDefault();
    try {
      const faceResponse = await axios.post(
        "http://127.0.0.1:8000/api/users/face-auth/",
        { username } // Send username to verify face
      );

      const { user, token } = faceResponse.data; // Destructure user and token
      console.log(user); // Check what user data is returned
      console.log(token); // Check the token returned

      if (user && token) {
        localStorage.setItem("token", JSON.stringify(token)); // Store token
        login(user); // Use context to handle login and redirection

        Swal.fire({
          title: "Face Verified!",
          text: "Your face has been authenticated successfully.",
          icon: "success",
          timer: 1500,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Face Authentication Failed",
          text: "Face does not match. Please try again.",
          icon: "error",
          timer: 2500,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Face Authentication Error:", error.response?.data || error.message);
      Swal.fire({
        title: "Error",
        text: "Face authentication could not be completed.",
        icon: "error",
        timer: 2500,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full mb-4 rounded-lg shadow-md"
          style={{ height: "300px" }} // Adjust height as needed
        />
        <form className="space-y-4" onSubmit={handleFaceAuthentication}>
          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2"
          >
            Login with Face Authentication
          </button>
        </form>
        <div className="mt-4 text-center">
          <div className="mt-2">
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login Manually</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceAuth;