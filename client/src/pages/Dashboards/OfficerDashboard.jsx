import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ClipboardList,
  CheckSquare,
  Truck,
  Users,
  LogOut,
  Bell,
  Filter,
  Search,
  Eye,
  EyeOff,
  Check,
  X as XIcon
} from "lucide-react";
import {
  fetchLoadRequestsForApproval,
  approveLoadRequest,
  fetchNotifications
} from "../../store/slices/loadRequestSlice";
import { logout } from "../../store/slices/authSlice";

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    loadRequests, 
    loading, 
    error, 
    notifications 
  } = useSelector((state) => state.loadRequest);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState("Dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState(new Set());
  const [filters, setFilters] = useState({
    sku: "",
    customer: "",
    lsr: "",
    status: "all"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [approvalData, setApprovalData] = useState({});

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", icon: ClipboardList },
    { name: "Approve Loads", icon: CheckSquare },
    { name: "Truck Assignments", icon: Truck },
    { name: "Manage LSRs", icon: Users },
  ];

  // Fetch load requests for approval
  useEffect(() => {
    if (active === "Approve Loads") {
      dispatch(fetchLoadRequestsForApproval("1")); // Default depot
    }
  }, [active, dispatch]);

  // Fetch notifications
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications(user.id));
    }
  }, [dispatch, user?.id]);

  const toggleRequestExpansion = (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleBulkSelect = (requestId) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleBulkApprove = () => {
    // Implementation for bulk approve
    console.log("Bulk approve selected requests:", selectedRequests);
  };

  const handleApprovalChange = (requestId, skuId, approvedQty) => {
    setApprovalData(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [skuId]: approvedQty
      }
    }));
  };

  const handleTruckAssignment = (requestId, assignment) => {
    setApprovalData(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        truckAssignment: assignment
      }
    }));
  };

  const approveRequest = (requestId) => {
    const requestData = approvalData[requestId];
    if (requestData) {
      const approvedItems = Object.entries(requestData)
        .filter(([key]) => key !== 'truckAssignment')
        .map(([skuId, approvedQty]) => ({ skuId, approvedQty }));

      const approvalPayload = {
        requestId,
        approvedItems,
        truckAssignment: requestData.truckAssignment || {},
        approvedBy: user?.id || "officer"
      };

      dispatch(approveLoadRequest(approvalPayload));
    }
  };

  const filteredRequests = loadRequests.filter(request => {
    const matchesSearch = 
      request.skuId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.lsrId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (!filters.sku || request.skuId?.includes(filters.sku)) &&
      (!filters.customer || request.customerId?.includes(filters.customer)) &&
      (!filters.lsr || request.lsrId?.includes(filters.lsr));

    return matchesSearch && matchesFilters;
  });

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
              Officer Panel
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
              Welcome, {user?.name || "Agent Logistics Officer"}!
            </span>
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          {active === "Dashboard" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Pending Approvals</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {loadRequests.filter(r => r.status === "Submitted").length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Approved Today</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {loadRequests.filter(r => r.status === "Approved").length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Active Trucks</h3>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Total LSRs</h3>
                  <p className="text-2xl font-bold text-purple-600">15</p>
                </div>
              </div>
            </div>
          )}

          {active === "Approve Loads" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Load Request Approvals</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={selectedRequests.size === 0}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg"
                  >
                    Bulk Approve ({selectedRequests.size})
                  </button>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Filter by SKU"
                  value={filters.sku}
                  onChange={(e) => setFilters(prev => ({ ...prev, sku: e.target.value }))}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Filter by Customer"
                  value={filters.customer}
                  onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Filter by LSR"
                  value={filters.lsr}
                  onChange={(e) => setFilters(prev => ({ ...prev, lsr: e.target.value }))}
                  className="px-4 py-2 border rounded-lg"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

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
                        <th className="border px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRequests(new Set(filteredRequests.map(r => r.requestId)));
                              } else {
                                setSelectedRequests(new Set());
                              }
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="border px-4 py-3 text-left">LSR ID</th>
                        <th className="border px-4 py-3 text-left">SKU</th>
                        <th className="border px-4 py-3 text-left">Brand</th>
                        <th className="border px-4 py-3 text-left">Customer</th>
                        <th className="border px-4 py-3 text-left">Requested Qty</th>
                        <th className="border px-4 py-3 text-left">Approved Qty</th>
                        <th className="border px-4 py-3 text-left">Truck</th>
                        <th className="border px-4 py-3 text-left">Capacity Util.</th>
                        <th className="border px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request, index) => (
                        <React.Fragment key={`${request.requestId}-${request.skuId}-${request.customerId}-${index}`}>
                          <tr className="hover:bg-gray-50">
                            <td className="border px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedRequests.has(request.requestId)}
                                onChange={() => handleBulkSelect(request.requestId)}
                                className="rounded"
                              />
                            </td>
                            <td className="border px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleRequestExpansion(request.requestId)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {expandedRequests.has(request.requestId) ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <span className="font-medium">{request.lsrId}</span>
                              </div>
                            </td>
                            <td className="border px-4 py-3">
                              <div>
                                <p className="font-medium">{request.productName}</p>
                                <p className="text-sm text-gray-500">{request.skuId}</p>
                              </div>
                            </td>
                            <td className="border px-4 py-3">{request.brand}</td>
                            <td className="border px-4 py-3">{request.customerId}</td>
                            <td className="border px-4 py-3">
                              <span className="font-medium">{request.requestedQty}</span>
                            </td>
                            <td className="border px-4 py-3">
                              <input
                                type="number"
                                value={approvalData[request.requestId]?.[request.skuId] || request.approvedQty || 0}
                                onChange={(e) => handleApprovalChange(request.requestId, request.skuId, Number(e.target.value))}
                                className="border p-2 rounded w-20"
                                min="0"
                                max={request.requestedQty}
                              />
                            </td>
                            <td className="border px-4 py-3">
                              <select
                                value={approvalData[request.requestId]?.truckAssignment?.truckId || request.truckId || ""}
                                onChange={(e) => handleTruckAssignment(request.requestId, {
                                  truckId: e.target.value,
                                  driverId: "DR001",
                                  helperId: "HL001",
                                  capacity: 500
                                })}
                                className="border p-2 rounded w-32"
                              >
                                <option value="">Select Truck</option>
                                <option value="21">RJ14AB1234</option>
                                <option value="22">RJ14AB5678</option>
                                <option value="23">RJ14CD4321</option>
                              </select>
                            </td>
                            <td className="border px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                parseFloat(request.capacityUtilization) > 80 ? "bg-red-100 text-red-800" :
                                parseFloat(request.capacityUtilization) > 60 ? "bg-yellow-100 text-yellow-800" :
                                "bg-green-100 text-green-800"
                              }`}>
                                {request.capacityUtilization}
                              </span>
                            </td>
                            <td className="border px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => approveRequest(request.requestId)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Reject"
                                >
                                  <XIcon size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRequests.has(request.requestId) && (
                            <tr className="bg-gray-50">
                              <td colSpan="10" className="border px-4 py-3">
                                <div className="text-sm text-gray-600">
                                  <h4 className="font-semibold mb-2">Request Details</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <p><strong>Request ID:</strong> {request.requestId}</p>
                                      <p><strong>Journey Date:</strong> {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p><strong>Depot:</strong> {request.depotId}</p>
                                      <p><strong>Status:</strong> {request.status}</p>
                                    </div>
                                    <div>
                                      <p><strong>Driver:</strong> John Doe</p>
                                      <p><strong>Helper:</strong> Jane Smith</p>
                                    </div>
                                    <div>
                                      <p><strong>Notes:</strong> Priority delivery required</p>
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

          {active === "Truck Assignments" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Truck Assignments</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Available Trucks</h3>
                  <p className="text-2xl font-bold text-green-600">5</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Assigned Trucks</h3>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Average Utilization</h3>
                  <p className="text-2xl font-bold text-purple-600">75%</p>
                </div>
              </div>
            </div>
          )}

          {active === "Manage LSRs" && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">LSR Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Total LSRs</h3>
                  <p className="text-2xl font-bold text-blue-600">15</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Active LSRs</h3>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Average Performance</h3>
                  <p className="text-2xl font-bold text-purple-600">85%</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
