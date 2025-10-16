import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SkuTable() {
  const [skus, setSkus] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/sku")
      .then(res => setSkus(res.data))
      .catch(err => console.error("Error fetching SKUs:", err));
  }, []);

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">SKU List</h3>
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 border">SKU ID</th>
            <th className="px-3 py-2 border">Brand</th>
            <th className="px-3 py-2 border">Product Name</th>
            <th className="px-3 py-2 border">Pack Size</th>
            <th className="px-3 py-2 border">UOM</th>
          </tr>
        </thead>
        <tbody>
          {skus.length > 0 ? skus.map((s, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-2 border">{s.skuId}</td>
              <td className="px-3 py-2 border">{s.brand}</td>
              <td className="px-3 py-2 border">{s.productName}</td>
              <td className="px-3 py-2 border">{s.packSize}</td>
              <td className="px-3 py-2 border">{s.uom}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="text-center py-3 text-gray-500">No SKUs</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
