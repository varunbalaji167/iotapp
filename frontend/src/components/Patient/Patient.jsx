// import React from 'react';
// import Navbar from '../Navbar';
// import PatientVitals from './PatientVitals';
// import PatientVitalsHistory from './PatientVitalsHistory';

// const Patient = () => {
//   return (
//     <div>
//       <Navbar />
//       <PatientVitals/>
//       <PatientVitalsHistory/>
//     </div>
//   );
// };

// export default Patient;

import React from 'react'
import PatientNavbar from './PatientNavbar'
import PatientVitals from './PatientVitals'

const Patient = () => {
  return (
    <>
    <PatientNavbar/>
    <PatientVitals/>
    </>
  )
}

export default Patient