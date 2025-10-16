import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LSRLoadRequest() {
  const [truck, setTruck] = useState(null);
  const [load, setLoad] = useState([]);
  const [buffer, setBuffer] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:5000/api/load-requests/recommended/501") // Example LSR ID
      .then(res => {
        setTruck(res.data);
        setLoad(res.data.load);
      });
  }, []);

  const handleQtyChange = (index, value) => {
    const updated = [...load];
    updated[index].requestedQty = value;
    setLoad(updated);
  };

  const addSKU = () => {
    setLoad([...load, {
      skuId: Date.now().toString(),
      skuName: "New SKU",
      brand: "",
      outletId: "-",
      orderType: "Priority",
      requestedQty: 0
    }]);
  };

  const submitRequest = () => {
    axios.post("http://localhost:5000/api/load-requests", {
      lsrId: "501",
      selectedTruckId: truck.truckId,
      bufferAdjustment: buffer,
      lineItems: load
    }).then(() => alert("Load request submitted!"));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>LSR Load Request</h2>
      {truck && (
        <p>
          Truck: {truck.truckNumber} (Capacity: {truck.capacity})
        </p>
      )}
      <label>Buffer Adjustment: </label>
      <input
        type="number"
        value={buffer}
        onChange={e => setBuffer(Number(e.target.value))}
      />
      <table border="1" cellPadding="5" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Brand</th>
            <th>Outlet</th>
            <th>Order Type</th>
            <th>Requested Qty</th>
          </tr>
        </thead>
        <tbody>
          {load.map((item, i) => (
            <tr key={i}>
              <td>{item.skuName}</td>
              <td>{item.brand}</td>
              <td>{item.outletId}</td>
              <td>{item.orderType}</td>
              <td>
                <input
                  type="number"
                  value={item.requestedQty}
                  onChange={e => handleQtyChange(i, Number(e.target.value))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addSKU} style={{ marginTop: 10 }}>+ Add SKU</button>
      <br />
      <button onClick={submitRequest} style={{ marginTop: 20 }}>Submit</button>
    </div>
  );
}
