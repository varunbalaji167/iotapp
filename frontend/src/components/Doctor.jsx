import React from "react";
import Navbar from "./Navbar";
import PatientRecords from "./PatientRecords";
import DoctorVitals from "./DoctorVitals";

const Patient = () => {
  return (
    <div>
      <Navbar />
      <DoctorVitals/>
      <PatientRecords/>
    </div>
  );
};

export default Patient;
