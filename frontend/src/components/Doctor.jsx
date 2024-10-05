import React from "react";
import Navbar from "./Navbar";
import PatientRecords from "./PatientRecords";
import DoctorVitals from "./DoctorVitals";

const Patient = () => {
  return (
    <div>
      <Navbar />
      <h1>Doctor Dashboard</h1>
      <DoctorVitals/>
      <PatientRecords/>
    </div>
  );
};

export default Patient;
