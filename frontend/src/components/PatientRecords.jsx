// //src/components/PatientRecords.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useTable, useGlobalFilter, useSortBy } from "react-table";
// import { useAuth } from "../contexts/AuthContext"; // Assuming you have an AuthContext to get user role
// import { jwtDecode } from "jwt-decode";

// const PatientRecords = () => {
//   const { userRole } = useAuth(); // Get user role from Auth context
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filterInput, setFilterInput] = useState("");

//   // Check if user is a doctor
//   if (userRole !== "doctor") {
//     return (
//       <div className="text-red-500 text-center">
//         Access denied. Only doctors can view this page.
//       </div>
//     );
//   }

//   // Fetching data from the API
//   useEffect(() => {
//     const fetchData = async () => {
//       const token = JSON.parse(localStorage.getItem("token"));
//       if (!token) {
//         setError("Authentication token is missing.");
//         setLoading(false);
//         return;
//       }

//       const getTokenInfo = (token) => {
//         try {
//           return jwtDecode(token.access);
//         } catch (error) {
//           setError("Invalid authentication token.");
//           return null;
//         }
//       };

//       const tokenInfo = getTokenInfo(token);

//       if (!tokenInfo) {
//         setError("Invalid authentication token.");
//         setLoading(false);
//         return;
//       }

//       const now = Date.now() / 1000;
//       if (tokenInfo.exp < now) {
//         setError("Authentication token has expired. Please log in again.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get(
//           "http://localhost:8000/api/users/patient-profiles/",
//           {
//             headers: {
//               Authorization: `Bearer ${token.access}`,
//             },
//           }
//         );
//         setData(response.data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [userRole]); // Added userRole as a dependency

//   // Define columns for the table
//   const columns = React.useMemo(
//     () => [
//       {
//         Header: "Profile",
//         accessor: "profile_picture",
//         Cell: ({ value }) => (
//           <img
//             src={
//               value.startsWith("data:image")
//                 ? value
//                 : `http://localhost:8000${value}`
//             }
//             alt="Profile"
//             className="w-12 h-12 rounded-full"
//           />
//         ),
//       },
//       {
//         Header: "ABHA ID",
//         accessor: "unique_id",
//       },
//       {
//         Header: "Name",
//         accessor: "name",
//       },
//       {
//         Header: "Date of Birth",
//         accessor: "dob",
//       },
//     ],
//     []
//   );

//   // Filter function
//   const handleFilterChange = (e) => {
//     const value = e.target.value || undefined;
//     setFilterInput(value);
//   };

//   // Use the useTable hook
//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
//     useTable(
//       {
//         columns,
//         data,
//       },
//       useGlobalFilter,
//       useSortBy
//     );

//   if (loading) return <div className="text-center py-4">Loading...</div>;
//   if (error) return <div className="text-red-500 text-center">{error}</div>;

//   return (
//     <div className="max-w-6xl mx-auto p-5 bg-white shadow-md rounded-lg">
//       <h1 className="text-2xl font-bold mb-4 text-center">Patient Records</h1>
//       <input
//         value={filterInput}
//         onChange={handleFilterChange}
//         placeholder="Search..."
//         className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
//       />
//       <table
//         {...getTableProps()}
//         className="min-w-full bg-gray-100 border border-gray-300 rounded-lg overflow-hidden"
//       >
//         <thead className="bg-blue-500 text-white">
//           {headerGroups.map((headerGroup) => (
//             <tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map((column) => (
//                 <th
//                   {...column.getHeaderProps(column.getSortByToggleProps())}
//                   className="py-3 px-4 text-left border-b border-gray-300"
//                 >
//                   {column.render("Header")}
//                   <span>
//                     {column.isSorted
//                       ? column.isSortedDesc
//                         ? " 🔽"
//                         : " 🔼"
//                       : ""}
//                   </span>
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody {...getTableBodyProps()} className="bg-white">
//           {rows.map((row) => {
//             prepareRow(row);
//             return (
//               <tr {...row.getRowProps()} className="hover:bg-gray-50">
//                 {row.cells.map((cell) => {
//                   return (
//                     <td
//                       {...cell.getCellProps()}
//                       className="py-2 px-4 border-b border-gray-300"
//                     >
//                       {cell.render("Cell")}
//                     </td>
//                   );
//                 })}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default PatientRecords;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTable, useGlobalFilter, useSortBy } from "react-table";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an AuthContext to get user role
import { jwtDecode } from "jwt-decode";

const PatientRecords = () => {
  const { userRole } = useAuth(); // Get user role from Auth context
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterInput, setFilterInput] = useState("");

  // Check if user is a doctor
  if (userRole !== "doctor") {
    return (
      <div className="text-red-500 text-center">
        Access denied. Only doctors can view this page.
      </div>
    );
  }

  // Fetching data from the API
  useEffect(() => {
    const fetchData = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }

      const getTokenInfo = (token) => {
        try {
          return jwtDecode(token.access);
        } catch (error) {
          setError("Invalid authentication token.");
          return null;
        }
      };

      const tokenInfo = getTokenInfo(token);

      if (!tokenInfo) {
        setError("Invalid authentication token.");
        setLoading(false);
        return;
      }

      const now = Date.now() / 1000;
      if (tokenInfo.exp < now) {
        setError("Authentication token has expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8000/api/users/patient-profiles/",
          {
            headers: {
              Authorization: `Bearer ${token.access}`,
            },
          }
        );

        // Set data to response data or an empty array if no profiles exist
        setData(response.data.length > 0 ? response.data : [{ id: null, unique_id: null, name: "No profiles available", dob: null, profile_picture: null }]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole]);

  // Define columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: "Profile",
        accessor: "profile_picture",
        Cell: ({ value }) => (
          <img
            src={
              value && value.startsWith("data:image")
                ? value
                : value
                ? `http://localhost:8000${value}`
                : null
            }
            alt="Profile"
            className="w-12 h-12 rounded-full"
          />
        ),
      },
      {
        Header: "ABHA ID",
        accessor: "unique_id",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Date of Birth",
        accessor: "dob",
      },
    ],
    []
  );

  // Use the useTable hook with global filtering
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter,
    useSortBy
  );

  // Handle filter change
  const handleFilterChange = (e) => {
    const value = e.target.value || undefined;
    setFilterInput(value);
    setGlobalFilter(value); // Set global filter
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-5 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Patient Records</h1>
      <input
        value={filterInput}
        onChange={handleFilterChange}
        placeholder="Search..."
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
      />
      {data.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No patient records available.</div>
      ) : (
        <table
          {...getTableProps()}
          className="min-w-full bg-gray-100 border border-gray-300 rounded-lg overflow-hidden"
        >
          <thead className="bg-blue-500 text-white">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="py-3 px-4 text-left border-b border-gray-300"
                  >
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white">
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-50">
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        className="py-2 px-4 border-b border-gray-300"
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientRecords;