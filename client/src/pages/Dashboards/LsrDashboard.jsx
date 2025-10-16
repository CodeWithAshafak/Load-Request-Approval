import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  FileText,
  Package,
  BarChart,
  LogOut,
  Settings,
  Bell,
  Plus,
  Minus,
  Eye,
  EyeOff,
  History,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  fetchRecommendedLoad,
  submitLoadRequest,
  fetchNotifications,
  updateRecommendedLoad,
  addBufferAdjustment
} from "../../store/slices/loadRequestSlice";
import { logout, clearToken } from "../../store/slices/authSlice";
import DashboardHome from "./LsrDashboardHome";
import SkuTable from "./SkuTable";
import VehicleTable from "./VehicleTable";
import OrdersTable from "./OrdersTable";

export default function LsrDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    recommendedLoad, 
    loading, 
    error, 
    notifications 
  } = useSelector((state) => state.loadRequest);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState("Dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [bufferAdjustment, setBufferAdjustment] = useState(0);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // LSR ID from user or default
  const LSR_ID = user?.id || user?.email || "501";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleRelogin = () => {
    dispatch(clearToken());
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", icon: Home },
    { name: "Load Requests", icon: FileText },
    { name: "Orders", icon: Package },
    { name: "Reports", icon: BarChart },
    { name: "Admin Panel", icon: Settings },
    { name: "History", icon: History },
  ];

  // Fetch recommended load when Load Requests tab is active
  useEffect(() => {
    if (active === "Load Requests" && !recommendedLoad) {
      dispatch(fetchRecommendedLoad(LSR_ID));
    }
    // Reset pagination when switching tabs
    if (active === "Load Requests") {
      setCurrentPage(1);
    }
  }, [active, dispatch, LSR_ID, recommendedLoad]);

  // Fetch notifications
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications(user.id));
    }
  }, [dispatch, user?.id]);

  const handleQtyChange = (index, value) => {
    if (recommendedLoad) {
      const actualIndex = (currentPage - 1) * itemsPerPage + index;
      const updatedLoad = recommendedLoad.load.map((item, i) => 
        i === actualIndex 
          ? { ...item, requestedQty: Number(value) }
          : item
      );
      dispatch(updateRecommendedLoad(updatedLoad));
    }
  };

  const addSKUToLoad = () => {
    if (recommendedLoad) {
      const newSkuNumber = recommendedLoad.load.length + 1;
      const updatedLoad = [
        ...recommendedLoad.load,
        {
          skuId: `SKU_${Date.now()}_${newSkuNumber}`,
          skuName: `Product ${newSkuNumber}`,
          brand: "Generic Brand",
          outletId: `OUTLET_${Math.floor(Math.random() * 1000) + 100}`,
          orderType: "Priority",
          requestedQty: 0,
          recommendedQty: Math.floor(Math.random() * 50) + 10,
          availableStock: Math.floor(Math.random() * 100) + 50,
        },
      ];
      dispatch(updateRecommendedLoad(updatedLoad));
    }
  };

  const removeSKUFromLoad = (index) => {
    if (recommendedLoad) {
      const actualIndex = (currentPage - 1) * itemsPerPage + index;
      const updatedLoad = recommendedLoad.load.filter((_, i) => i !== actualIndex);
      dispatch(updateRecommendedLoad(updatedLoad));
      // Reset to page 1 if current page becomes empty
      const newTotalPages = Math.ceil((recommendedLoad.load.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handleBufferChange = (value) => {
    setBufferAdjustment(Number(value));
    dispatch(addBufferAdjustment(Number(value)));
  };

  const handleSubmitLoadRequest = () => {
    if (recommendedLoad) {
      const requestData = {
        lsrId: LSR_ID,
        selectedTruckId: recommendedLoad.truckId,
        bufferAdjustment: bufferAdjustment,
        lineItems: recommendedLoad.load,
      };
      dispatch(submitLoadRequest(requestData)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 5000); // Hide after 5 seconds
        }
      });
    }
  };

  const toggleItemExpansion = (index) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(actualIndex)) {
      newExpanded.delete(actualIndex);
    } else {
      newExpanded.add(actualIndex);
    }
    setExpandedItems(newExpanded);
  };

  const unreadNotifications = notifications.filter(n => n.status === "Unread").length;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky z-50 inset-y-0 left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm ${
          sidebarOpen ? "w-64" : "w-20"
        } transform transition-all duration-200 ease-in-out`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && (
            <span className="text-lg font-bold text-gray-800">LSR Panel</span>
          )}
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-3">
          <div className="space-y-1">
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
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
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
              Welcome, {user?.name || "Van Sales Rep"}!
            </span>
            
            {/* Re-login button for token issues */}
            <button
              onClick={handleRelogin}
              className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition"
              title="Re-login if experiencing token issues"
            >
              Re-login
            </button>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          {active === "Dashboard" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Dashboard Overview</h2>
              <DashboardHome />
            </div>
          )}

          {active === "Load Requests" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 p-4 bg-red-50 rounded">
                  Error: {error}
                </div>
              ) : submitSuccess ? (
                <div className="text-green-600 p-4 bg-green-50 rounded">
                  ✅ Load request submitted successfully! The officer has been notified.
                </div>
              ) : recommendedLoad ? (
                <>
                  {/* Truck Information */}
                  <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-blue-800 mb-2">Truck Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Truck Number:</span>
                        <p className="font-medium">{recommendedLoad.truckNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Capacity:</span>
                        <p className="font-medium">{recommendedLoad.capacity} units</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Buffer Adjustment:</span>
                        <input
                          type="number"
                          value={bufferAdjustment}
                          onChange={(e) => handleBufferChange(e.target.value)}
                          className="mt-1 border p-2 rounded w-24"
                          placeholder="+/-"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Load Items */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Load Items</h3>
                      <button
                        onClick={addSKUToLoad}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        <Plus size={16} />
                        Add SKU
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="border px-4 py-3 text-left">SKU</th>
                            <th className="border px-4 py-3 text-left">Brand</th>
                            <th className="border px-4 py-3 text-left">Outlet</th>
                            <th className="border px-4 py-3 text-left">Order Type</th>
                            <th className="border px-4 py-3 text-left">Requested Qty</th>
                            <th className="border px-4 py-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const indexOfLastItem = currentPage * itemsPerPage;
                            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                            const currentItems = recommendedLoad.load.slice(indexOfFirstItem, indexOfLastItem);
                            return currentItems.map((item, i) => (
                            <React.Fragment key={i}>
                              <tr className="hover:bg-gray-50">
                                <td className="border px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleItemExpansion(i)}
                                      className="p-1 hover:bg-gray-200 rounded"
                                    >
                                      {expandedItems.has((currentPage - 1) * itemsPerPage + i) ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <span className="font-medium">{item.skuName}</span>
                                  </div>
                                </td>
                                <td className="border px-4 py-3">{item.brand}</td>
                                <td className="border px-4 py-3">{item.outletId}</td>
                                <td className="border px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    item.orderType === "Recommended" ? "bg-blue-100 text-blue-800" :
                                    item.orderType === "PreOrder" ? "bg-green-100 text-green-800" :
                                    item.orderType === "POSM" ? "bg-purple-100 text-purple-800" :
                                    item.orderType === "PSR" ? "bg-orange-100 text-orange-800" :
                                    "bg-gray-100 text-gray-800"
                                  }`}>
                                    {item.orderType}
                                  </span>
                                </td>
                                <td className="border px-4 py-3">
                                  <input
                                    type="number"
                                    value={item.requestedQty}
                                    onChange={(e) => handleQtyChange(i, e.target.value)}
                                    className="border p-2 rounded w-20"
                                    min="0"
                                  />
                                </td>
                                <td className="border px-4 py-3">
                                  <button
                                    onClick={() => removeSKUFromLoad(i)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Minus size={16} />
                                  </button>
                                </td>
                              </tr>
                              {expandedItems.has((currentPage - 1) * itemsPerPage + i) && (
                                <tr className="bg-gray-50">
                                  <td colSpan="6" className="border px-4 py-3">
                                    <div className="text-sm text-gray-600">
                                      <p><strong>SKU ID:</strong> {item.skuId}</p>
                                      <p><strong>Details:</strong> Additional information for {item.skuName}</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {recommendedLoad.load.length > itemsPerPage && (
                      <div className="flex items-center justify-between mt-4 px-4">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, recommendedLoad.load.length)} of {recommendedLoad.load.length} items
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            <ChevronLeft size={16} />
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(recommendedLoad.load.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-lg transition ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(recommendedLoad.load.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(recommendedLoad.load.length / itemsPerPage)}
                            className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Next
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Load Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Total Items:</span>
                        <p className="font-medium">{recommendedLoad.load.length}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Total Quantity:</span>
                        <p className="font-medium">
                          {recommendedLoad.load.reduce((sum, item) => sum + item.requestedQty, 0)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Buffer Adjustment:</span>
                        <p className="font-medium">{bufferAdjustment}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Capacity Utilization:</span>
                        <p className="font-medium">
                          {((recommendedLoad.load.reduce((sum, item) => sum + item.requestedQty, 0) / recommendedLoad.capacity) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitLoadRequest}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                    >
                      {loading ? "Submitting..." : "Submit Load Request"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No load data available</p>
                </div>
              )}
            </div>
          )}

          {active === "Orders" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Orders Management</h2>
              <OrdersTable />
            </div>
          )}

          {active === "Reports" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Reports & Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Load Requests</h3>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Approved Loads</h3>
                  <p className="text-2xl font-bold text-green-600">10</p>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Shipped Loads</h3>
                  <p className="text-2xl font-bold text-purple-600">8</p>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
              </div>
            </div>
          )}

          {active === "Admin Panel" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">SKU Management</h3>
                  <SkuTable />
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Vehicle Management</h3>
                  <VehicleTable />
                </div>
              </div>
            </div>
          )}

          {active === "History" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Request History</h2>
              <p className="text-gray-600">View all your submitted load requests and their status.</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">History feature coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
