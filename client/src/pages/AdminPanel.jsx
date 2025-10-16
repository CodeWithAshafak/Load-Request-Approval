import React, { useState } from "react";
import axios from "axios";

export default function AdminPanel() {
  const [sku, setSku] = useState({ skuId: "", brand: "", productName: "", packSize: "", uom: "" });
  const [vehicle, setVehicle] = useState({ truckId: "", truckNo: "", capacity: "", status: "Available", depotId: "1" });
  const [order, setOrder] = useState({ lsrId: "501", outletId: "", skuId: "", qty: "", type: "Recommended" });

  const addSKU = async () => {
    await axios.post("http://localhost:5000/api/admin/sku", sku);
    alert("SKU added");
    setSku({ skuId: "", brand: "", productName: "", packSize: "", uom: "" });
  };

  const addVehicle = async () => {
    await axios.post("http://localhost:5000/api/admin/vehicle", vehicle);
    alert("Vehicle added");
    setVehicle({ truckId: "", truckNo: "", capacity: "", status: "Available", depotId: "1" });
  };

  const addOrder = async () => {
    await axios.post("http://localhost:5000/api/admin/order", order);
    alert("Order added");
    setOrder({ lsrId: "501", outletId: "", skuId: "", qty: "", type: "Recommended" });
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">Admin Panel - Add Test Data</h1>

      <div className="mb-6 border p-4">
        <h2 className="font-semibold">Add SKU</h2>
        <input placeholder="SKU ID" value={sku.skuId} onChange={e => setSku({...sku, skuId: e.target.value})} />
        <input placeholder="Brand" value={sku.brand} onChange={e => setSku({...sku, brand: e.target.value})} />
        <input placeholder="Product Name" value={sku.productName} onChange={e => setSku({...sku, productName: e.target.value})} />
        <input placeholder="Pack Size" value={sku.packSize} onChange={e => setSku({...sku, packSize: e.target.value})} />
        <input placeholder="UOM" value={sku.uom} onChange={e => setSku({...sku, uom: e.target.value})} />
        <button onClick={addSKU}>Add SKU</button>
      </div>

      <div className="mb-6 border p-4">
        <h2 className="font-semibold">Add Vehicle</h2>
        <input placeholder="Truck ID" value={vehicle.truckId} onChange={e => setVehicle({...vehicle, truckId: e.target.value})} />
        <input placeholder="Truck No" value={vehicle.truckNo} onChange={e => setVehicle({...vehicle, truckNo: e.target.value})} />
        <input placeholder="Capacity" type="number" value={vehicle.capacity} onChange={e => setVehicle({...vehicle, capacity: e.target.value})} />
        <select value={vehicle.status} onChange={e => setVehicle({...vehicle, status: e.target.value})}>
          <option>Available</option>
          <option>Assigned</option>
        </select>
        <input placeholder="Depot ID" value={vehicle.depotId} onChange={e => setVehicle({...vehicle, depotId: e.target.value})} />
        <button onClick={addVehicle}>Add Vehicle</button>
      </div>

      <div className="mb-6 border p-4">
        <h2 className="font-semibold">Add Order</h2>
        <input placeholder="LSR ID" value={order.lsrId} onChange={e => setOrder({...order, lsrId: e.target.value})} />
        <input placeholder="Outlet ID" value={order.outletId} onChange={e => setOrder({...order, outletId: e.target.value})} />
        <input placeholder="SKU ID" value={order.skuId} onChange={e => setOrder({...order, skuId: e.target.value})} />
        <input placeholder="Quantity" type="number" value={order.qty} onChange={e => setOrder({...order, qty: e.target.value})} />
        <select value={order.type} onChange={e => setOrder({...order, type: e.target.value})}>
          <option>Recommended</option>
          <option>PreOrder</option>
          <option>POSM</option>
          <option>PSR</option>
        </select>
        <button onClick={addOrder}>Add Order</button>
      </div>
    </div>
  );
}
