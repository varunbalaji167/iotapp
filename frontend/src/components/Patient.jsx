import React from 'react';
import Navbar from './Navbar';
import PatientVitals from './PatientVitals';

const Patient = () => {
  return (
    <div>
      <Navbar />
      <PatientVitals/>
      {/* Patient-specific content here */}
    </div>
  );
};

export default Patient;