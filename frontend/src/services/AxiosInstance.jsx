//src/services/AxiosInstance.jsx
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in the headers for protected routes
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token"); // Retrieve the token from localStorage
//     if (token && !config.url.includes("/login/")) {
//       // Exclude login requests
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.url.includes("/login/")) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token added to request headers:", config.headers.Authorization);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

