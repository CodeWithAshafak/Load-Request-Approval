import React, { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersTable() {
  const [orders, setOrders] = useState({ recommended: [], preOrders: [], posmOrders: [], psrOrders: [] });

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.error("Error fetching orders:", err));
  }, []);

  const renderRows = (type, data) =>
    data.map((o, i) => (
      <tr key={`${type}-${i}`} className="hover:bg-gray-50">
        <td className="px-3 py-2 border">{type}</td>
        <td className="px-3 py-2 border">{o.lsrId}</td>
        <td className="px-3 py-2 border">{o.outletId}</td>
        <td className="px-3 py-2 border">{o.skuId}</td>
        <td className="px-3 py-2 border">{o.qty}</td>
      </tr>
    ));

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Orders</h3>
      <table className="w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 border">Order Type</th>
            <th className="px-3 py-2 border">LSR ID</th>
            <th className="px-3 py-2 border">Outlet ID</th>
            <th className="px-3 py-2 border">SKU ID</th>
            <th className="px-3 py-2 border">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {renderRows("Recommended", orders.recommended)}
          {renderRows("PreOrder", orders.preOrders)}
          {renderRows("POSM", orders.posmOrders)}
          {renderRows("PSR", orders.psrOrders)}
        </tbody>
      </table>
    </div>
  );
}
