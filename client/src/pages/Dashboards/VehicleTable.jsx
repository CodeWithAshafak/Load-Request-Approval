import React, { useEffect, useState } from "react";
import axios from "axios";

export default function VehicleTable() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/vehicle")
      .then(res => setVehicles(res.data))
      .catch(err => console.error("Error fetching vehicles:", err));
  }, []);

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Vehicles</h3>
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 border">Truck ID</th>
            <th className="px-3 py-2 border">Truck No</th>
            <th className="px-3 py-2 border">Capacity</th>
            <th className="px-3 py-2 border">Status</th>
            <th className="px-3 py-2 border">Depot ID</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length > 0 ? vehicles.map((v, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-2 border">{v.truckId}</td>
              <td className="px-3 py-2 border">{v.truckNo}</td>
              <td className="px-3 py-2 border">{v.capacity}</td>
              <td className="px-3 py-2 border">{v.status}</td>
              <td className="px-3 py-2 border">{v.depotId}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="text-center py-3 text-gray-500">No vehicles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
