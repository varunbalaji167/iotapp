// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { Line } from "react-chartjs-2";
// import { useAuth } from "../../contexts/AuthContext";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import PatientNavbar from "./PatientNavbar";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faThermometerHalf,
//   faHeartbeat,
//   faTint,
//   faVial,
//   faLungs,
// } from "@fortawesome/free-solid-svg-icons"; // Importing specific icons

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const PatientVitalsHistory = () => {
//   const { userRole } = useAuth();
//   const [vitalData, setVitalData] = useState([]);
//   const [error, setError] = useState("");

//   // Set the initial date as today's date in Indian Standard Time in 'yyyy-mm-dd' format
//   const today = new Date().toLocaleDateString("en-CA"); // "en-CA" gives the format yyyy-mm-dd
//   const [selectedFilters, setSelectedFilters] = useState({
//     temperature: { date: today, filterType: "date" },
//     glucose_level: { date: today, filterType: "date" },
//     heart_rate: { date: today, filterType: "date" },
//     spo2: { date: today, filterType: "date" },
//     sys: { date: today, filterType: "date" },
//     dia: { date: today, filterType: "date" },
//   });

//   const fetchVitalHistory = async (accessToken) => {
//     try {
//       const response = await axios.get(
//         "https://147.79.67.165:8000/api/users/patientvitals/history/",
//         {
//           headers: { Authorization: "Bearer " + accessToken },
//         }
//       );
//       setVitalData(response.data);
//     } catch (error) {
//       console.error("Error fetching vitals:", error.response?.data);
//       setError("Failed to fetch vitals data.");
//     }
//   };

//   const handleTokenRefresh = async () => {
//     const tokens = JSON.parse(localStorage.getItem("token"));
//     const refreshToken = tokens?.refresh;

//     if (!refreshToken) {
//       setError("Refresh token is missing.");
//       return;
//     }

//     try {
//       const response = await axios.post(
//         "https://147.79.67.165:8000/api/users/refresh/",
//         {
//           refresh: refreshToken,
//         }
//       );
//       localStorage.setItem(
//         "token",
//         JSON.stringify({
//           access: response.data.access,
//           refresh: refreshToken,
//         })
//       );
//       const newAccessToken = response.data.access;
//       fetchVitalHistory(newAccessToken);
//     } catch (error) {
//       console.error("Error refreshing token:", error.response?.data);
//       setError("Failed to refresh token. Please log in again.");
//     }
//   };

//   useEffect(() => {
//     const initTokenHandling = () => {
//       const tokens = JSON.parse(localStorage.getItem("token"));
//       const accessToken = tokens?.access;

//       if (!accessToken) {
//         setError("Authentication tokens are missing.");
//         return;
//       }

//       const tokenInfo = jwtDecode(accessToken);
//       const now = Date.now() / 1000;
//       const expiresIn = tokenInfo.exp - now;

//       if (expiresIn > 60) {
//         fetchVitalHistory(accessToken);
//       } else {
//         handleTokenRefresh();
//       }
//     };

//     if (userRole === "patient") {
//       initTokenHandling();
//     }
//   }, [userRole]);

//   const filterDataByDate = (data, currentFilter) => {
//     return data.filter((item) => {
//       const recordedDate = new Date(item.recorded_at);
//       if (currentFilter.filterType === "date" && currentFilter.date) {
//         const selectedDateStart = new Date(currentFilter.date);
//         selectedDateStart.setHours(0, 0, 0, 0);
//         const selectedDateEnd = new Date(currentFilter.date);
//         selectedDateEnd.setHours(23, 59, 59, 999);
//         return (
//           recordedDate >= selectedDateStart && recordedDate <= selectedDateEnd
//         );
//       }
//       return true; // Only handle 'date' filter now
//     });
//   };

//   const getChartData = (dataKey, label, borderColor) => {
//     const currentFilter = selectedFilters[dataKey] || {
//       date: today,
//       filterType: "date",
//     };
//     const filteredData = filterDataByDate(vitalData, currentFilter);

//     // Reverse the filtered data to make the time increasing
//     const reversedData = filteredData.reverse();

//     const labels = reversedData.map((item) => {
//       const recordedDate = new Date(item.recorded_at);
//       return recordedDate.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     });
//     const data = reversedData.map((item) => item[dataKey]);

//     return {
//       labels,
//       datasets: [
//         {
//           label,
//           data,
//           borderColor,
//           fill: false,
//           tension: 0.3,
//         },
//       ],
//     };
//   };

//   return (
//     <div className="bg-slate-100">
//       <PatientNavbar />
//       <div className="container mx-auto p-6">
//         <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
//           Your Vital History
//         </h2>
//         {error && <p className="text-red-500 text-center mb-4">{error}</p>}
//         <div className="grid grid-cols-1 gap-6">
//           {[
//             {
//               key: "temperature",
//               label: "Temperature (°F)",
//               borderColor: "rgba(255, 99, 132, 1)",
//               icon: faThermometerHalf,
//             },
//             {
//               key: "heart_rate",
//               label: "Heart Rate (bpm)",
//               borderColor: "rgba(153, 102, 255, 1)",
//               icon: faHeartbeat,
//             },
//             {
//               key: "spo2",
//               label: "SpO2 (%)",
//               borderColor: "rgba(255, 159, 64, 1)",
//               icon: faTint,
//             },
//             {
//               key: "glucose_level",
//               label: "Glucose Level (mg/dL)",
//               borderColor: "rgba(54, 162, 235, 1)",
//               icon: faVial,
//             },
//             {
//               key: "sys",
//               label: "Systolic BP (mmHg)",
//               borderColor: "rgba(75, 192, 192, 1)",
//               icon: faLungs,
//             },
//             {
//               key: "dia",
//               label: "Diastolic BP (mmHg)",
//               borderColor: "rgba(75, 192, 192, 1)",
//               icon: faLungs,
//             },
//           ].map(({ key, label, borderColor, icon }) => {
//             const currentFilter = selectedFilters[key] || {
//               date: today,
//               filterType: "date",
//             };
//             return (
//               <div
//                 key={key}
//                 className="bg-white shadow-md rounded-lg p-4 flex flex-col transition-transform duration-300 ease-in-out hover:shadow-xl hover:scale-105 h-full"
//               >
//                 <div className="flex items-center mb-2">
//                   <FontAwesomeIcon
//                     icon={icon}
//                     className="text-2xl text-gray-600 mr-2"
//                   />
//                   <h3 className="text-xl font-semibold text-gray-800">
//                     {label}
//                   </h3>
//                 </div>
//                 {currentFilter.filterType === "date" && (
//                   <input
//                     type="date"
//                     value={currentFilter.date}
//                     onChange={(e) =>
//                       setSelectedFilters({
//                         ...selectedFilters,
//                         [key]: { ...currentFilter, date: e.target.value },
//                       })
//                     }
//                     className="border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out hover:border-blue-500"
//                   />
//                 )}
//                 <div className="flex-grow h-64">
//                   <Line
//                     data={getChartData(key, label, borderColor)}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false, // Ensure chart is responsive
//                       plugins: {
//                         tooltip: {
//                           callbacks: {
//                             label: (tooltipItem) =>
//                               `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
//                           },
//                         },
//                       },
//                       scales: {
//                         x: {
//                           title: {
//                             display: true,
//                             text: "Time",
//                             color: "#555",
//                           },
//                           grid: {
//                             color: "rgba(0, 0, 0, 0.1)", // Subtle grid lines for better readability
//                           },
//                         },
//                         y: {
//                           title: {
//                             display: true,
//                             text: label,
//                             color: "#555",
//                           },
//                           grid: {
//                             color: "rgba(0, 0, 0, 0.1)",
//                           },
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PatientVitalsHistory;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Line } from "react-chartjs-2";
import { useAuth } from "../../contexts/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PatientNavbar from "./PatientNavbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThermometerHalf,
  faHeartbeat,
  faTint,
  faVial,
  faLungs,
} from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PatientVitalsHistory = () => {
  const { userRole } = useAuth();
  const [vitalData, setVitalData] = useState([]);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-CA");
  const [selectedFilters, setSelectedFilters] = useState({
    temperature: { date: today, filterType: "date" },
    glucose_level: { date: today, filterType: "date" },
    heart_rate: { date: today, filterType: "date" },
    spo2: { date: today, filterType: "date" },
    sys: { date: today, filterType: "date" },
    dia: { date: today, filterType: "date" },
  });

  const fetchVitalHistory = async (accessToken) => {
    try {
      const response = await axios.get(
        "https://147.79.67.165:8000/api/users/patientvitals/history/",
        {
          headers: { Authorization: "Bearer " + accessToken },
        }
      );
      setVitalData(response.data);
    } catch (error) {
      console.error("Error fetching vitals:", error.response?.data);
      setError("Failed to fetch vitals data.");
    }
  };

  const handleConnect = async () => {
    const tokens = JSON.parse(localStorage.getItem("token"));
    const accessToken = tokens?.access;

    if (!accessToken) {
      setError("Authentication tokens are missing.");
      return;
    }

    try {
      const response = await axios.get(
        "https://147.79.67.165:8000/api/users/generate-pdf/",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
          responseType: "json", // Change to JSON to capture the URL
        }
      );

      // Open the PDF URL in a new tab
      const pdfUrl = response.data.pdf_url;
      window.open(pdfUrl, "_blank"); // Open the PDF in a new tab

      // The download part has been removed
    } catch (error) {
      console.error("Error generating PDF:", error.response?.data);
      setError("Failed to generate PDF report.");
    }
  };

  const handleTokenRefresh = async () => {
    const tokens = JSON.parse(localStorage.getItem("token"));
    const refreshToken = tokens?.refresh;

    if (!refreshToken) {
      setError("Refresh token is missing.");
      return;
    }

    try {
      const response = await axios.post(
        "https://147.79.67.165:8000/api/users/refresh/",
        {
          refresh: refreshToken,
        }
      );
      localStorage.setItem(
        "token",
        JSON.stringify({
          access: response.data.access,
          refresh: refreshToken,
        })
      );
      const newAccessToken = response.data.access;
      fetchVitalHistory(newAccessToken);
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data);
      setError("Failed to refresh token. Please log in again.");
    }
  };

  useEffect(() => {
    const initTokenHandling = () => {
      const tokens = JSON.parse(localStorage.getItem("token"));
      const accessToken = tokens?.access;

      if (!accessToken) {
        setError("Authentication tokens are missing.");
        return;
      }

      const tokenInfo = jwtDecode(accessToken);
      const now = Date.now() / 1000;
      const expiresIn = tokenInfo.exp - now;

      if (expiresIn > 60) {
        fetchVitalHistory(accessToken);
      } else {
        handleTokenRefresh();
      }
    };

    if (userRole === "patient") {
      initTokenHandling();
    }
  }, [userRole]);

  const filterDataByDate = (data, currentFilter) => {
    return data.filter((item) => {
      const recordedDate = new Date(item.recorded_at);
      if (currentFilter.filterType === "date" && currentFilter.date) {
        const selectedDateStart = new Date(currentFilter.date);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(currentFilter.date);
        selectedDateEnd.setHours(23, 59, 59, 999);
        return (
          recordedDate >= selectedDateStart && recordedDate <= selectedDateEnd
        );
      }
      return true;
    });
  };

  const getChartData = (dataKey, label, borderColor) => {
    const currentFilter = selectedFilters[dataKey] || {
      date: today,
      filterType: "date",
    };
    const filteredData = filterDataByDate(vitalData, currentFilter);
    const reversedData = filteredData.reverse();

    const labels = reversedData.map((item) => {
      const recordedDate = new Date(item.recorded_at);
      return recordedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    });
    const data = reversedData.map((item) => item[dataKey]);

    return {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor,
          fill: false,
          tension: 0.3,
        },
      ],
    };
  };

  return (
    <div className="bg-slate-100">
      <PatientNavbar />
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
          Your Vital History
        </h2>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleConnect}
            className="bg-blue-500 hover:bg-blue-600 mb-4 text-white font-bold py-3 px-6 rounded-md transition duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
          >
            Print latest Vitals Report
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="grid grid-cols-1 gap-6">
          {[
            {
              key: "temperature",
              label: "Temperature (°F)",
              borderColor: "rgba(255, 99, 132, 1)",
              icon: faThermometerHalf,
            },
            {
              key: "heart_rate",
              label: "Heart Rate (bpm)",
              borderColor: "rgba(153, 102, 255, 1)",
              icon: faHeartbeat,
            },
            {
              key: "spo2",
              label: "SpO2 (%)",
              borderColor: "rgba(255, 159, 64, 1)",
              icon: faTint,
            },
            {
              key: "glucose_level",
              label: "Glucose Level (mg/dL)",
              borderColor: "rgba(54, 162, 235, 1)",
              icon: faVial,
            },
            {
              key: "sys",
              label: "Systolic BP (mmHg)",
              borderColor: "rgba(75, 192, 192, 1)",
              icon: faLungs,
            },
            {
              key: "dia",
              label: "Diastolic BP (mmHg)",
              borderColor: "rgba(75, 192, 192, 1)",
              icon: faLungs,
            },
          ].map(({ key, label, borderColor, icon }) => {
            const currentFilter = selectedFilters[key] || {
              date: today,
              filterType: "date",
            };
            return (
              <div
                key={key}
                className="bg-white shadow-md rounded-lg p-4 flex flex-col transition-transform duration-300 ease-in-out hover:shadow-xl hover:scale-105 h-full"
              >
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon
                    icon={icon}
                    className="text-2xl text-gray-600 mr-2"
                  />
                  <h3 className="text-xl font-semibold text-gray-800">
                    {label}
                  </h3>
                </div>
                {currentFilter.filterType === "date" && (
                  <input
                    type="date"
                    value={currentFilter.date}
                    onChange={(e) =>
                      setSelectedFilters({
                        ...selectedFilters,
                        [key]: { ...currentFilter, date: e.target.value },
                      })
                    }
                    className="border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out hover:border-blue-500"
                  />
                )}
                <div className="flex-grow h-64">
                  <Line
                    data={getChartData(key, label, borderColor)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (tooltipItem) =>
                              `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: "Time",
                            color: "#555",
                          },
                          grid: {
                            color: "rgba(0, 0, 0, 0.1)",
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: label,
                            color: "#555",
                          },
                          grid: {
                            color: "rgba(0, 0, 0, 0.1)",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientVitalsHistory;
