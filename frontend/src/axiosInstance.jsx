import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.warn("VITE_API_BASE_URL is not defined. Please check your .env file.");
}
console.log("Base URL:", baseURL);

const axiosInstance = axios.create({
  baseURL: baseURL, // Base URL from .env
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;