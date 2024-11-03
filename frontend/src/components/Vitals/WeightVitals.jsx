import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";

const WeightVitals = ({
  profileExists,
  requestWeight,
  handleRetry,
  handleSkip,
  hardwareConfigured,
  statusMessagew,
  connected,
  sensorErrorPromptw,
  loadingw,
  weight,
  setStatusMessageW,
}) => {
  const { userRole } = useAuth();

  useEffect(() => {
    if (statusMessagew === "Reading Complete") {
      const timer = setTimeout(() => setStatusMessageW(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessagew]);

  const StatusMessage = ({ message }) => {
    let bgColor, textColor, Icon;

    switch (message) {
      case "Hardware Configured":
        bgColor = "bg-green-100 border-l-4 border-green-500";
        textColor = "text-green-800";
        Icon = FaCheckCircle;
        break;
      case "Weight Sensor Initialized":
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
      case "Sensor Reading Failed":
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
        Calculate Your Weight
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
              onClick={requestWeight}
              disabled={!connected || loadingw || !hardwareConfigured}
              className={`mt-2 py-2 px-6 rounded-md shadow-md transition duration-300 text-white ${
                !connected || loadingw || !hardwareConfigured
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {loadingw ? (
                <ClipLoader color="#fff" size={20} />
              ) : (
                "Request Weight"
              )}
            </button>
          </div>

          {statusMessagew && <StatusMessage message={statusMessagew} />}

          {sensorErrorPromptw && (
            <div className="mt-4 flex">
              <button
                onClick={handleRetry}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md mr-2 shadow-md transition duration-300"
              >
                Retry
              </button>
              <button
                onClick={handleSkip}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
              >
                Skip
              </button>
            </div>
          )}

          {weight && (
            <p className="mt-6 text-lg text-gray-800">
              Weight:{" "}
              <span className="font-bold text-blue-600">{weight} kg </span>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default WeightVitals;
