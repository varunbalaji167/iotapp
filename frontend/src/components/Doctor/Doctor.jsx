// import React from "react";
// import Navbar from "../Navbar";
// import PatientRecords from "./PatientRecords";
// import DoctorVitals from "./DoctorVitals";
// import DoctorVitalsHistory from "./DoctorVitalsHistory";

// const Patient = () => {
//   return (
//     <div>
//       <Navbar />
//       <DoctorVitals />
//       <PatientRecords />
//       <DoctorVitalsHistory />
//     </div>
//   );
// };

// export default Patient;

import React from 'react'
import DoctorNavbar from './DoctorNavbar'
import DoctorVitals from './DoctorVitals'

const Doctor = () => {
  return (
    <>
    <DoctorNavbar/>
    <DoctorVitals/>
    </>
  )
}

export default Doctor