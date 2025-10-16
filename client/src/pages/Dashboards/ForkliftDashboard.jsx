import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ClipboardList,
  Truck,
  PackageCheck,
  AlertTriangle,
  LogOut,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import {
  fetchLoadAssignments,
  logShipment,
  fetchNotifications
} from "../../store/slices/loadRequestSlice";
import { logout } from "../../store/slices/authSlice";

export default function ForkliftDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    loadAssignments, 
    loading, 
    error, 
    notifications 
  } = useSelector((state) => state.loadRequest);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState("Dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedAssignments, setExpandedAssignments] = useState(new Set());
  const [shipmentData, setShipmentData] = useState({});
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [showShipmentModal, setShowShipmentModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", icon: ClipboardList },
    { name: "Load Assignments", icon: Truck },
    { name: "Shipped Orders", icon: PackageCheck },
    { name: "Discrepancies", icon: AlertTriangle },
  ];

  // Fetch load assignments
  useEffect(() => {
    if (active === "Load Assignments") {
      dispatch(fetchLoadAssignments());
    }
  }, [active, dispatch]);

  // Fetch notifications
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications(user.id));
    }
  }, [dispatch, user?.id]);

  const toggleAssignmentExpansion = (assignmentId) => {
    const newExpanded = new Set(expandedAssignments);
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId);
    } else {
      newExpanded.add(assignmentId);
    }
    setExpandedAssignments(newExpanded);
  };

  const startLoading = (assignment) => {
    setCurrentAssignment(assignment);
    setShipmentData({
      loadingStart: new Date(),
      items: assignment.loadRequest?.lineItems?.map(item => ({
        skuId: item.skuId,
        skuName: item.skuName,
        approvedQty: item.approvedQty,
        shippedQty: 0,
        discrepancyReason: null,
        discrepancyDetails: ""
      })) || []
    });
    setShowShipmentModal(true);
  };

  const handleShipmentChange = (skuId, field, value) => {
    setShipmentData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.skuId === skuId ? { ...item, [field]: value } : item
      )
    }));
  };

  const completeShipment = () => {
    if (currentAssignment && shipmentData.items.length > 0) {
      const shipmentPayload = {
        assignmentId: currentAssignment.assignmentId,
        shipmentData: {
          ...shipmentData,
          loadingEnd: new Date(),
          departureTime: new Date()
        }
      };
      dispatch(logShipment(shipmentPayload));
      setShowShipmentModal(false);
      setCurrentAssignment(null);
      setShipmentData({});
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Assigned":
        return <Clock className="text-blue-500" size={16} />;
      case "Loading":
        return <AlertCircle className="text-yellow-500" size={16} />;
      case "Shipped":
        return <CheckCircle className="text-green-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-100 text-blue-800";
      case "Loading":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const unreadNotifications = notifications.filter(n => n.status === "Unread").length;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 inset-y-0 left-0 bg-white border-r border-gray-200 shadow-sm ${
          sidebarOpen ? "w-64" : "w-20"
        } transform transition-all duration-200 ease-in-out`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && (
            <span className="text-lg font-bold text-gray-800">
              Forklift Panel
            </span>
          )}
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-gray-700 font-medium transition ${
                active === item.name
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

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
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">{active}</h1>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 relative"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.notificationId}
                        className={`p-3 border-b hover:bg-gray-50 ${
                          notification.status === "Unread" ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdOn).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500 text-center">
                      No notifications
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <span className="text-gray-600 hidden sm:inline">
              Welcome, {user?.name || "Forklift Operator"}!
            </span>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          {active === "Dashboard" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Pending Loads</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {loadAssignments.filter(a => a.status === "Assigned").length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Loading</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {loadAssignments.filter(a => a.status === "Loading").length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Shipped Today</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {loadAssignments.filter(a => a.status === "Shipped").length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Discrepancies</h3>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
              </div>
            </div>
          )}

          {active === "Load Assignments" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Load Assignments</h2>
              
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 p-4 bg-red-50 rounded">
                  Error: {error}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-4 py-3 text-left">Assignment ID</th>
                        <th className="border px-4 py-3 text-left">Truck</th>
                        <th className="border px-4 py-3 text-left">Driver</th>
                        <th className="border px-4 py-3 text-left">Status</th>
                        <th className="border px-4 py-3 text-left">Items</th>
                        <th className="border px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadAssignments.map((assignment) => (
                        <React.Fragment key={assignment.assignmentId}>
                          <tr className="hover:bg-gray-50">
                            <td className="border px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleAssignmentExpansion(assignment.assignmentId)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {expandedAssignments.has(assignment.assignmentId) ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <span className="font-medium">{assignment.assignmentId}</span>
                              </div>
                            </td>
                            <td className="border px-4 py-3">
                              <div>
                                <p className="font-medium">Truck {assignment.truckId}</p>
                                <p className="text-sm text-gray-500">Capacity: {assignment.capacity}</p>
                              </div>
                            </td>
                            <td className="border px-4 py-3">
                              <div>
                                <p className="font-medium">Driver {assignment.driverId}</p>
                                <p className="text-sm text-gray-500">Helper {assignment.helperId}</p>
                              </div>
                            </td>
                            <td className="border px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(assignment.status)}
                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(assignment.status)}`}>
                                  {assignment.status}
                                </span>
                              </div>
                            </td>
                            <td className="border px-4 py-3">
                              <span className="font-medium">
                                {assignment.loadRequest?.lineItems?.length || 0} items
                              </span>
                            </td>
                            <td className="border px-4 py-3">
                              {assignment.status === "Assigned" && (
                                <button
                                  onClick={() => startLoading(assignment)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                                >
                                  Start Loading
                                </button>
                              )}
                              {assignment.status === "Loading" && (
                                <button
                                  onClick={() => startLoading(assignment)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                                >
                                  Complete Loading
                                </button>
                              )}
                            </td>
                          </tr>
                          {expandedAssignments.has(assignment.assignmentId) && (
                            <tr className="bg-gray-50">
                              <td colSpan="6" className="border px-4 py-3">
                                <div className="text-sm text-gray-600">
                                  <h4 className="font-semibold mb-2">Load Details</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p><strong>Request ID:</strong> {assignment.requestId}</p>
                                      <p><strong>Assigned At:</strong> {new Date(assignment.assignedAt).toLocaleString()}</p>
                                      <p><strong>Utilization:</strong> {assignment.utilizationPct}%</p>
                                    </div>
                                    <div>
                                      <h5 className="font-semibold mb-1">Load Items:</h5>
                                      {assignment.loadRequest?.lineItems?.map((item, index) => (
                                        <div key={index} className="text-xs mb-1">
                                          <span className="font-medium">{item.skuName}</span> - 
                                          Approved: {item.approvedQty}, 
                                          Shipped: {item.shippedQty || 0}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {active === "Shipped Orders" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Shipped Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Today's Shipments</h3>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Total Items Shipped</h3>
                  <p className="text-2xl font-bold text-blue-600">1,250</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Average Loading Time</h3>
                  <p className="text-2xl font-bold text-purple-600">45 min</p>
                </div>
              </div>
            </div>
          )}

          {active === "Discrepancies" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Discrepancies</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Stock Shortages</h3>
                  <p className="text-2xl font-bold text-red-600">5</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Damaged Items</h3>
                  <p className="text-2xl font-bold text-orange-600">2</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Capacity Issues</h3>
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Shipment Modal */}
      {showShipmentModal && currentAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Log Shipment - {currentAssignment.assignmentId}</h3>
              <button
                onClick={() => setShowShipmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p><strong>Loading Start:</strong> {shipmentData.loadingStart?.toLocaleString()}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 text-left">SKU</th>
                    <th className="border px-4 py-2 text-left">Approved Qty</th>
                    <th className="border px-4 py-2 text-left">Shipped Qty</th>
                    <th className="border px-4 py-2 text-left">Discrepancy Reason</th>
                    <th className="border px-4 py-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentData.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">
                        <div>
                          <p className="font-medium">{item.skuName}</p>
                          <p className="text-sm text-gray-500">{item.skuId}</p>
                        </div>
                      </td>
                      <td className="border px-4 py-2">
                        <span className="font-medium">{item.approvedQty}</span>
                      </td>
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          value={item.shippedQty}
                          onChange={(e) => handleShipmentChange(item.skuId, 'shippedQty', Number(e.target.value))}
                          className="border p-2 rounded w-20"
                          min="0"
                          max={item.approvedQty}
                        />
                      </td>
                      <td className="border px-4 py-2">
                        {item.shippedQty < item.approvedQty && (
                          <select
                            value={item.discrepancyReason || ""}
                            onChange={(e) => handleShipmentChange(item.skuId, 'discrepancyReason', e.target.value)}
                            className="border p-2 rounded w-40"
                          >
                            <option value="">Select Reason</option>
                            <option value="Stock Shortage">Stock Shortage</option>
                            <option value="Damaged Stock">Damaged Stock</option>
                            <option value="Truck Capacity Limitation">Truck Capacity Limitation</option>
                            <option value="Other">Other</option>
                          </select>
                        )}
                      </td>
                      <td className="border px-4 py-2">
                        {item.discrepancyReason && (
                          <input
                            type="text"
                            value={item.discrepancyDetails}
                            onChange={(e) => handleShipmentChange(item.skuId, 'discrepancyDetails', e.target.value)}
                            placeholder="Details..."
                            className="border p-2 rounded w-40"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowShipmentModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={completeShipment}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Complete Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
