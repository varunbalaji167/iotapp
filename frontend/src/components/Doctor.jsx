import React from "react";
import Navbar from "./Navbar";
import PatientRecords from "./PatientRecords";

const Patient = () => {
  return (
    <div>
      <Navbar />
      <h1>Doctor Dashboard</h1>
      <PatientRecords/>
    </div>
  );
};

export default Patient;
