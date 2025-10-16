import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  Package,
  BarChart,
  LogOut
} from "lucide-react";
import axios from "axios";

export default function LsrDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState("Dashboard");

  // LSR Load Request state
  const LSR_ID = "501"; // Replace with logged-in user's ID
  const [truck, setTruck] = useState(null);
  const [load, setLoad] = useState([]);
  const [buffer, setBuffer] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", icon: Home, link: "#" },
    { name: "Load Requests", icon: FileText, link: "#" },
    { name: "Orders", icon: Package, link: "#" },
    { name: "Reports", icon: BarChart, link: "#" },
  ];

  // Fetch recommended load when dashboard loads
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/load-requests/recommended/${LSR_ID}`)
      .then((res) => {
        setTruck(res.data);
        setLoad(res.data.load);
        setLoading(false);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error fetching load data");
        setLoading(false);
      });
  }, []);

  const handleQtyChange = (index, value) => {
    const updated = [...load];
    updated[index].requestedQty = Number(value);
    setLoad(updated);
  };

  const addSKU = () => {
    setLoad([
      ...load,
      {
        skuId: Date.now().toString(),
        skuName: "New SKU",
        brand: "",
        outletId: "-",
        orderType: "Priority",
        requestedQty: 0,
      },
    ]);
  };

  const submitRequest = () => {
    axios
      .post("http://localhost:5000/api/load-requests", {
        lsrId: LSR_ID,
        selectedTruckId: truck.truckId,
        bufferAdjustment: buffer,
        lineItems: load,
      })
      .then(() => {
        alert("✅ Load request submitted!");
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error submitting request");
      });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 inset-y-0 left-0 bg-white border-r border-gray-200 shadow-sm ${
          sidebarOpen ? "w-64" : "w-20"
        } transform transition-all duration-200 ease-in-out`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && <span className="text-lg font-bold text-gray-800">LSR Panel</span>}
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => setActive(item.name)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 font-medium transition ${
                active === item.name
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.name}</span>}
            </a>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">{active}</h1>
          <span className="text-gray-600 hidden sm:inline">Welcome, Van Sales Rep!</span>
        </header>

        {/* Content Area */}
        <main className="p-6 flex-1 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">LSR Load Request</h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                {truck && (
                  <div className="mb-4 p-3 border rounded bg-gray-50">
                    <p><strong>Default Truck:</strong> {truck.truckNumber}</p>
                    <p><strong>Capacity:</strong> {truck.capacity}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block mb-1 font-medium">Buffer Adjustment (+/-)</label>
                  <input
                    type="number"
                    value={buffer}
                    onChange={(e) => setBuffer(Number(e.target.value))}
                    className="border p-2 rounded w-40"
                  />
                </div>

                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-3 py-2">SKU</th>
                      <th className="border px-3 py-2">Brand</th>
                      <th className="border px-3 py-2">Outlet</th>
                      <th className="border px-3 py-2">Order Type</th>
                      <th className="border px-3 py-2">Requested Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {load.map((item, i) => (
                      <tr key={i}>
                        <td className="border px-3 py-2">{item.skuName}</td>
                        <td className="border px-3 py-2">{item.brand}</td>
                        <td className="border px-3 py-2">{item.outletId}</td>
                        <td className="border px-3 py-2">{item.orderType}</td>
                        <td className="border px-3 py-2">
                          <input
                            type="number"
                            value={item.requestedQty}
                            onChange={(e) => handleQtyChange(i, e.target.value)}
                            className="border p-1 rounded w-20"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={addSKU}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    + Add SKU
                  </button>
                  <button
                    onClick={submitRequest}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Submit Request
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
