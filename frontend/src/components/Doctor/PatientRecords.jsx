//src/components/PatientRecords.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTable, useGlobalFilter, useSortBy } from "react-table";
import { useAuth } from "../../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import DoctorNavbar from "./DoctorNavbar";

const PatientRecords = () => {
  const { userRole } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterInput, setFilterInput] = useState("");

  if (userRole !== "doctor") {
    return (
      <div className="text-red-500 text-center">
        Access denied. Only doctors can view this page.
      </div>
    );
  }

  useEffect(() => {
    let refreshTimeout; // Store the timeout to clear it properly

    const fetchData = async (accessToken) => {
      setLoading(true); // Start loading when fetching data

      try {
        const response = await axios.get(
          "http://localhost:8000/api/users/patient-profiles/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setData(response.data.length > 0 ? response.data : []);
        setLoading(false); // Stop loading after fetching
      } catch (err) {
        setError(err.message);
        setLoading(false); // Stop loading in case of error
      }
    };

    const scheduleTokenRefresh = (expiresIn) => {
      const timeout = expiresIn - 60; // Refresh 1 minute before expiration
      refreshTimeout = setTimeout(async () => {
        await handleTokenRefresh(); // Call the refresh function
      }, timeout * 1000);
    };

    const handleTokenRefresh = async () => {
      const token = JSON.parse(localStorage.getItem("token"));
      const refreshToken = token?.refresh;

      if (!refreshToken) {
        setError("Refresh token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:8000/api/users/refresh/",
          {
            refresh: refreshToken,
          }
        );

        // Update tokens in localStorage
        const newAccessToken = response.data.access;
        localStorage.setItem(
          "token",
          JSON.stringify({
            access: newAccessToken,
            refresh: refreshToken, // Keep the same refresh token
          })
        );

        const tokenInfo = jwtDecode(newAccessToken);
        const now = Date.now() / 1000;
        const expiresIn = tokenInfo.exp - now;

        scheduleTokenRefresh(expiresIn); // Schedule the next refresh
        fetchData(newAccessToken); // Fetch data with the new access token
      } catch (error) {
        setError("Failed to refresh token. Please log in again.");
        setLoading(false);
      }
    };

    const initTokenHandling = () => {
      const token = JSON.parse(localStorage.getItem("token"));
      const accessToken = token?.access;

      if (!accessToken) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }

      const tokenInfo = jwtDecode(accessToken);
      const now = Date.now() / 1000;
      const expiresIn = tokenInfo.exp - now;

      if (expiresIn > 60) {
        // If the token is valid for more than 1 minute
        scheduleTokenRefresh(expiresIn); // Schedule token refresh
        fetchData(accessToken); // Fetch data with current access token
      } else {
        // Token about to expire, refresh immediately
        handleTokenRefresh();
      }
    };

    // Initialize token handling on component mount
    if (userRole === "doctor") {
      initTokenHandling();
    }

    // Clean up any scheduled timeouts on component unmount
    return () => clearTimeout(refreshTimeout);
  }, [userRole]);

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
        Header: "Charak ID",
        accessor: "charak_id",
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

  const handleFilterChange = (e) => {
    const value = e.target.value || undefined;
    setFilterInput(value);
    setGlobalFilter(value);
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col">
      <DoctorNavbar />
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Patient Records
        </h1>
        
        <input
          value={filterInput}
          onChange={handleFilterChange}
          placeholder="Search..."
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />

        {data.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No patient records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              {...getTableProps()}
              className="min-w-full bg-gray-100 border border-gray-300 rounded-lg overflow-hidden"
            >
              <thead className="bg-blue-500 text-white">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="py-3 px-4 text-left border-b border-gray-300 whitespace-nowrap"
                        key={column.id}
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
                    <tr
                      {...row.getRowProps()}
                      className="hover:bg-gray-50 transition-colors"
                      key={row.original.charak_id || row.id}
                    >
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          className="py-2 px-4 border-b border-gray-300 whitespace-nowrap text-gray-700 text-sm lg:text-base"
                          key={cell.row.id + cell.column.id} // Use both row.id and column.id for uniqueness
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;