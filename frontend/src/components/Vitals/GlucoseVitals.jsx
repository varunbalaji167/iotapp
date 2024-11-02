import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";

const GlucoseVitals = ({
  profileExists,
  requestGlucose,
  handleRetry,
  handleSkip,
  hardwareConfigured,
  statusMessageg,
  connected,
  sensorErrorPromptg,
  loadingg,
  glucose,
  setStatusMessageG,
}) => {
  const { userRole } = useAuth();
  useEffect(() => {
    if (statusMessageg === "Reading Complete") {
      const timer = setTimeout(() => setStatusMessageG(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessageg]);

  const StatusMessage = ({ message }) => {
    let bgColor, textColor, Icon;

    switch (message) {
      case "Hardware Configured":
        bgColor = "bg-green-100 border-l-4 border-green-500";
        textColor = "text-green-800";
        Icon = FaCheckCircle;
        break;
      case "Glucose Sensor Initialized":
        bgColor = "bg-green-100 border-l-4 border-green-500";
        textColor = "text-green-800";
        Icon = FaCheckCircle;
        break;
      case "Sensor Initialization Failed":
      case "Sensor Reading Failed":
        bgColor = "bg-red-100 border-l-4 border-red-500";
        textColor = "text-red-800";
        Icon = FaTimesCircle;
        break;
      case "Reading Complete":
        bgColor = "bg-blue-100 border-l-4 border-blue-500";
        textColor = "text-blue-800";
        Icon = FaCheckCircle;
        break;
      case "Calculating":
        bgColor = "bg-yellow-100 border-l-4 border-yellow-500";
        textColor = "text-yellow-800";
        Icon = FaInfoCircle;
        break;
      case "Please place your finger properly.":
        bgColor = "bg-orange-100 border-l-4 border-orange-500";
        textColor = "text-orange-800";
        Icon = FaExclamationTriangle;
        break;
      default:
        bgColor = "bg-gray-100 border-l-4 border-gray-500";
        textColor = "text-gray-800";
        Icon = FaTimesCircle;
        break;
    }

    return (
      <div
        className={`flex items-center p-4 my-4 rounded-lg shadow-md transition duration-300 ease-in-out ${bgColor} ${textColor}`}
      >
        <Icon className={`${textColor} mr-2`} size={20} />
        <p>{message}</p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-center mb-4">
      </div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Calculate Your Glucose Levels
      </h1>
      {!profileExists ? (
        <p className="text-lg text-gray-600">
          Please create your profile to continue.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700">
              Collect Vitals:
            </h2>
            <button
              onClick={requestGlucose}
              disabled={!connected || loadingg || !hardwareConfigured}
              className={`mt-2 py-2 px-6 rounded-md shadow-md transition duration-300 text-white ${
                !connected || loadingg || !hardwareConfigured
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loadingg ? (
                <ClipLoader color="#fff" size={20} />
              ) : (
                "Request Glucose"
              )}
            </button>
          </div>

          {statusMessageg && <StatusMessage message={statusMessageg} />}

          {sensorErrorPromptg && (
            <div className="mt-4 flex">
              <button
                onClick={handleRetry}
                className="bg-green-500 text-white font-bold py-2 px-4 rounded mr-4"
              >
                Retry
              </button>
              <button
                onClick={handleSkip}
                className="bg-yellow-500 text-white font-bold py-2 px-4 rounded"
              >
                Skip
              </button>
            </div>
          )}

          {glucose && (
            <p className="mt-6 text-lg text-gray-800">
              Glucose:{" "}
              <span className="font-bold text-blue-600">{glucose} mg/dl</span>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default GlucoseVitals;
